/**
 * Elghali AI - Predictions API
 * Main API endpoint for horse racing predictions
 */

import { NextRequest, NextResponse } from 'next/server'
import { UAE_RACES, RACECOURSES, getRaceData, normalizeRacecourse } from '@/lib/race-database'
import { predictionEngine } from '@/lib/prediction-engine-v2'
import { pdfGenerator } from '@/lib/pdf-generator-v2'
import { sendPredictionEmail } from '@/lib/email-service-v2'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, racecourse, email, sendEmail } = body

    console.log(`[API] Request: date=${date}, racecourse=${racecourse}, email=${email}`)

    // Validate required fields
    if (!date || !racecourse) {
      return NextResponse.json({
        success: false,
        message: 'التاريخ واسم المضمار مطلوبان',
        racecourse: racecourse || '',
        date: date || '',
        totalRaces: 0,
        races: [],
        napOfTheDay: { horseName: '', raceName: '', reason: '', confidence: 0 },
        nextBest: { horseName: '', raceName: '', reason: '' },
        valuePick: { horseName: '', raceName: '', reason: '' },
        sources: [],
        availableRacecourses: getRacecoursesByCountry()
      }, { status: 400 })
    }

    // Normalize racecourse name
    const normalizedName = normalizeRacecourse(racecourse)
    
    // Find race data
    const raceDayData = getRaceData(normalizedName, date)
    
    if (!raceDayData) {
      return NextResponse.json({
        success: false,
        message: `لا توجد سباقات في ${normalizedName} بتاريخ ${date}`,
        racecourse: normalizedName,
        date,
        totalRaces: 0,
        races: [],
        napOfTheDay: { horseName: '', raceName: '', reason: '', confidence: 0 },
        nextBest: { horseName: '', raceName: '', reason: '' },
        valuePick: { horseName: '', raceName: '', reason: '' },
        sources: [],
        availableRacecourses: getRacecoursesByCountry()
      }, { status: 404 })
    }

    console.log(`[API] Found ${raceDayData.races.length} races`)

    // Generate predictions for each race
    const racePredictions = []
    const allPredictions: any[] = []

    for (const race of raceDayData.races) {
      const prediction = predictionEngine.predictRace(race, normalizedName)
      
      racePredictions.push({
        raceNumber: race.number,
        raceName: race.name,
        raceTime: race.time,
        surface: race.surface,
        distance: race.distance,
        going: race.going,
        predictions: prediction.predictions.slice(0, 5).map((p, i) => ({
          position: i + 1,
          number: p.number,
          name: p.name,
          draw: p.draw,
          jockey: p.jockey,
          trainer: p.trainer,
          rating: p.rating,
          powerScore: p.powerScore,
          winProbability: p.winProbability,
          placeProbability: p.placeProbability,
          valueRating: p.valueRating,
          form: p.form,
          weight: p.weight,
          strengths: p.strengths,
          concerns: p.concerns,
          analysis: p.analysis
        })),
        raceAnalysis: prediction.raceAnalysis
      })

      // Collect all predictions for NAP selection
      prediction.predictions.forEach((p, i) => {
        allPredictions.push({
          ...p,
          raceNumber: race.number,
          raceName: race.name,
          position: i + 1
        })
      })
    }

    // Sort by power score to find best overall picks
    allPredictions.sort((a, b) => b.powerScore - a.powerScore)

    // NAP of the Day - highest power score
    const napPick = allPredictions[0]
    
    // Next Best - second highest
    const nextBestPick = allPredictions[1] || allPredictions[0]
    
    // Value Pick - best value rating in top 10
    const valuePickHorse = allPredictions.slice(0, 10).find(p => 
      p.valueRating === 'Excellent' || p.valueRating === 'Good'
    ) || allPredictions[2] || allPredictions[0]

    // Prepare report data
    const reportData = {
      racecourse: raceDayData.racecourse,
      country: raceDayData.country,
      date: raceDayData.date,
      totalRaces: raceDayData.races.length,
      races: racePredictions.map(rp => ({
        ...rp,
        predictions: rp.predictions.map(p => ({
          ...p,
          strengths: p.strengths || [],
          concerns: p.concerns || []
        }))
      })),
      napOfTheDay: {
        horseName: napPick.name,
        raceName: napPick.raceName,
        reason: `Power Score: ${napPick.powerScore} | Win: ${napPick.winProbability.toFixed(1)}% | الفارس: ${napPick.jockey}`,
        confidence: Math.min(99, Math.round(napPick.winProbability * 2.5 + napPick.powerScore / 2))
      },
      nextBest: {
        horseName: nextBestPick.name,
        raceName: nextBestPick.raceName,
        reason: `Power Score: ${nextBestPick.powerScore} | الفارس: ${nextBestPick.jockey}`
      },
      valuePick: {
        horseName: valuePickHorse.name,
        raceName: valuePickHorse.raceName,
        reason: `Value: ${valuePickHorse.valueRating} | Power: ${valuePickHorse.powerScore}`
      },
      generatedAt: new Date().toLocaleString('ar-AE', { timeZone: 'Asia/Dubai' })
    }

    // Generate PDF
    const pdfResult = await pdfGenerator.generateReport(reportData)
    console.log(`[API] PDF generated: ${pdfResult.success}`)

    // Send email if requested
    let emailSent = false
    if (sendEmail && email && pdfResult.success) {
      const emailResult = await sendPredictionEmail({
        to: email,
        racecourse: raceDayData.racecourse,
        date: raceDayData.date,
        totalRaces: raceDayData.races.length,
        napOfTheDay: reportData.napOfTheDay,
        pdfPath: pdfResult.pdfPath || undefined
      })
      emailSent = emailResult.success
      console.log(`[API] Email sent: ${emailSent}`)
    }

    // Get live stream URL
    const racecourseInfo = RACECOURSES.UAE.find(r => r.name === normalizedName)
    const liveStreamUrl = racecourseInfo?.liveStreamUrl || null

    // Return response
    return NextResponse.json({
      success: true,
      message: `تم تحليل ${raceDayData.races.length} سباق في ${raceDayData.racecourse} بنجاح`,
      racecourse: raceDayData.racecourse,
      country: raceDayData.country,
      date: raceDayData.date,
      totalRaces: raceDayData.races.length,
      races: racePredictions,
      napOfTheDay: reportData.napOfTheDay,
      nextBest: reportData.nextBest,
      valuePick: reportData.valuePick,
      sources: ['Emirates Racing Authority', 'Elghali AI Analysis'],
      pdfPath: pdfResult.success ? pdfResult.pdfPath : null,
      pdfGenerated: pdfResult.success,
      emailSent,
      liveStreamUrl,
      availableRacecourses: getRacecoursesByCountry()
    })

  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء معالجة الطلب',
      racecourse: '',
      date: '',
      totalRaces: 0,
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
 * GET - Available racecourses and dates
 */
export async function GET() {
  const availableDates = [...new Set(UAE_RACES.map(r => r.date))].sort()
  
  return NextResponse.json({
    success: true,
    racecourses: getRacecoursesByCountry(),
    availableDates,
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
