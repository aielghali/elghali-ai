import { NextRequest, NextResponse } from 'next/server'
import { raceDataFetcher, RACECOURSES } from '@/lib/race-data-fetcher'
import { predictionEngine } from '@/lib/prediction-engine'
import { pdfGenerator } from '@/lib/pdf-generator'
import { sendPredictionEmail } from '@/lib/email-service'
import type { HorsePrediction, RacePredictionData, ReportData } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, racecourse, email, sendEmail } = body

    // Validate required fields
    if (!date || !racecourse) {
      return NextResponse.json({
        success: false,
        message: 'التاريخ واسم المضمار مطلوبان',
        racecourse: racecourse || '',
        date: date || '',
        totalRaces: 0,
        predictions: [],
        races: [],
        napOfTheDay: { horseName: '', raceName: '', reason: '', confidence: 0 },
        nextBest: { horseName: '', raceName: '', reason: '' },
        valuePick: { horseName: '', raceName: '', reason: '' },
        sources: [],
        availableRacecourses: getRacecoursesByCountry()
      }, { status: 400 })
    }

    console.log(`[Predictions API] Racecourse: ${racecourse}, Date: ${date}`)

    // Fetch race data
    const fetchResult = await raceDataFetcher.fetchRaceData(racecourse, date)

    if (!fetchResult.success || !fetchResult.data) {
      return NextResponse.json({
        success: false,
        message: fetchResult.message || 'لم يتم العثور على بيانات السباق',
        racecourse,
        date,
        totalRaces: 0,
        predictions: [],
        races: [],
        napOfTheDay: { horseName: '', raceName: '', reason: '', confidence: 0 },
        nextBest: { horseName: '', raceName: '', reason: '' },
        valuePick: { horseName: '', raceName: '', reason: '' },
        sources: fetchResult.sources,
        availableRacecourses: getRacecoursesByCountry()
      }, { status: 404 })
    }

    const raceData = fetchResult.data
    const racePredictions: RacePredictionData[] = []

    // Generate predictions for each race
    for (const race of raceData.races) {
      const prediction = predictionEngine.predictRace(race)
      
      const horsePredictions: HorsePrediction[] = prediction.predictions.slice(0, 5).map(p => ({
        number: p.horse.number,
        name: p.horse.name,
        jockey: p.horse.jockey,
        trainer: p.horse.trainer,
        rating: p.horse.rating,
        powerScore: p.powerScore,
        winProbability: p.winProbability,
        placeProbability: p.placeProbability,
        draw: p.horse.draw,
        weight: p.horse.weight,
        form: p.horse.form,
        analysis: p.analysis,
        strengths: p.strengths,
        concerns: p.concerns,
        valueRating: p.valueRating
      }))

      racePredictions.push({
        raceNumber: race.number,
        raceName: race.name,
        raceTime: race.time,
        distance: race.distance,
        surface: race.surface,
        going: race.going,
        predictions: horsePredictions,
        raceAnalysis: prediction.raceAnalysis
      })
    }

    // Determine NAP, Next Best, and Value Pick
    const allPredictions = racePredictions.flatMap(r => 
      r.predictions.map(p => ({ ...p, raceName: r.raceName, raceNumber: r.raceNumber }))
    )
    
    // Sort by power score to find best overall
    const sortedPredictions = [...allPredictions].sort((a, b) => b.powerScore - a.powerScore)
    
    const napPick = sortedPredictions[0]
    const nextBestPick = sortedPredictions[1] || sortedPredictions[0]
    
    // Find value pick (good score with good value rating)
    const valuePickHorse = sortedPredictions.find(p => 
      p.valueRating === 'Excellent' || p.valueRating === 'Good'
    ) || sortedPredictions[2] || sortedPredictions[0]

    // Generate PDF report
    const reportData: ReportData = {
      racecourse: raceData.racecourse,
      country: raceData.country,
      date: raceData.date,
      totalRaces: raceData.races.length,
      races: racePredictions,
      napOfTheDay: {
        horseName: napPick.name,
        raceName: napPick.raceName,
        reason: `Power Score: ${napPick.powerScore.toFixed(1)} | Win Probability: ${napPick.winProbability.toFixed(1)}% | الفارس: ${napPick.jockey}`,
        confidence: Math.round(napPick.winProbability * 2)
      },
      nextBest: {
        horseName: nextBestPick.name,
        raceName: nextBestPick.raceName,
        reason: `Power Score: ${nextBestPick.powerScore.toFixed(1)} | الفارس: ${nextBestPick.jockey}`
      },
      valuePick: {
        horseName: valuePickHorse.name,
        raceName: valuePickHorse.raceName,
        reason: `Value Rating: ${valuePickHorse.valueRating} | Power Score: ${valuePickHorse.powerScore.toFixed(1)}`
      },
      sources: raceData.sources,
      generatedAt: new Date().toISOString()
    }

    // Generate PDF
    const pdfResult = await pdfGenerator.generateReport(reportData)

    // Send email if requested
    let emailSent = false
    if (sendEmail && email && pdfResult.success) {
      try {
        const emailResult = await sendPredictionEmail(
          email,
          raceData.racecourse,
          raceData.date,
          pdfResult.pdfPath,
          reportData.napOfTheDay,
          raceData.races.length
        )
        emailSent = emailResult.success
      } catch (emailError) {
        console.error('[Predictions API] Email error:', emailError)
      }
    }

    // Return the response
    return NextResponse.json({
      success: true,
      message: `تم تحليل ${raceData.races.length} سباق في ${raceData.racecourse} بنجاح`,
      racecourse: raceData.racecourse,
      country: raceData.country,
      date: raceData.date,
      totalRaces: raceData.races.length,
      races: racePredictions,
      predictions: racePredictions.map(r => ({
        raceNumber: r.raceNumber,
        raceName: r.raceName,
        raceTime: r.raceTime,
        surface: r.surface,
        distance: r.distance,
        predictions: r.predictions.slice(0, 5).map((p, i) => ({
          position: i + 1,
          horseNumber: p.number,
          horseName: p.name,
          draw: p.draw,
          jockey: p.jockey,
          trainer: p.trainer,
          rating: String(p.rating),
          powerScore: Math.round(p.powerScore * 10) / 10,
          winProbability: `${p.winProbability.toFixed(1)}%`,
          placeProbability: `${p.placeProbability.toFixed(1)}%`,
          valueRating: p.valueRating,
          analysis: p.strengths.slice(0, 2).join(' - '),
          strengths: p.strengths,
          concerns: p.concerns
        }))
      })),
      napOfTheDay: reportData.napOfTheDay,
      nextBest: reportData.nextBest,
      valuePick: reportData.valuePick,
      sources: raceData.sources,
      pdfPath: pdfResult.success ? pdfResult.pdfPath : null,
      pdfGenerated: pdfResult.success,
      emailSent,
      liveStreamUrl: raceData.races[0]?.liveStreamUrl || null,
      availableRacecourses: getRacecoursesByCountry()
    })

  } catch (error) {
    console.error('[Predictions API] Error:', error)
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء معالجة الطلب. حاول مرة أخرى.',
      racecourse: '',
      date: '',
      totalRaces: 0,
      predictions: [],
      races: [],
      napOfTheDay: { horseName: '', raceName: '', reason: '', confidence: 0 },
      nextBest: { horseName: '', raceName: '', reason: '' },
      valuePick: { horseName: '', raceName: '', reason: '' },
      sources: [],
      availableRacecourses: getRacecoursesByCountry()
    }, { status: 500 })
  }
}

/**
 * GET endpoint to fetch available racecourses
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    racecourses: getRacecoursesByCountry(),
    message: 'Available racecourses retrieved successfully'
  })
}

/**
 * Get racecourses grouped by country
 */
function getRacecoursesByCountry(): Record<string, { name: string; city: string }[]> {
  const result: Record<string, { name: string; city: string }[]> = {}
  
  for (const [country, courses] of Object.entries(RACECOURSES)) {
    result[country] = courses.map(c => ({
      name: c.name,
      city: c.city
    }))
  }
  
  return result
}
