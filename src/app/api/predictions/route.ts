/**
 * Elghali AI - API v3.0
 * With Withdrawals, Surprises, and Non-Competitor Support
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

    console.log(`[API v3.0] Request: date=${date}, racecourse=${racecourse}`)

    if (!date || !racecourse) {
      return NextResponse.json({
        success: false,
        message: 'التاريخ واسم المضمار مطلوبان',
        racecourse: racecourse || '',
        date: date || '',
        totalRaces: 0, races: [],
        napOfTheDay: { horseName: '', raceName: '', reason: '', confidence: 0 },
        nextBest: { horseName: '', raceName: '', reason: '' },
        valuePick: { horseName: '', raceName: '', reason: '' },
        sources: [],
        availableRacecourses: getRacecoursesByCountry()
      }, { status: 400 })
    }

    const normalizedName = normalizeRacecourse(racecourse)
    const raceDayData = getRaceData(normalizedName, date)
    
    if (!raceDayData) {
      return NextResponse.json({
        success: false,
        message: `لا توجد سباقات في ${normalizedName} بتاريخ ${date}`,
        racecourse: normalizedName, date,
        totalRaces: 0, races: [],
        napOfTheDay: { horseName: '', raceName: '', reason: '', confidence: 0 },
        nextBest: { horseName: '', raceName: '', reason: '' },
        valuePick: { horseName: '', raceName: '', reason: '' },
        sources: [],
        availableRacecourses: getRacecoursesByCountry()
      }, { status: 404 })
    }

    console.log(`[API v3.0] Found ${raceDayData.races.length} races for ${normalizedName}`)

    const racePredictions = []
    const allPredictions: any[] = []
    const allWithdrawals: string[] = []
    const allNonRunners: string[] = []
    const allSurprises: string[] = []

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
          analysis: p.analysis,
          isWithdrawn: p.isWithdrawn,
          isNonRunner: p.isNonRunner,
          hasNoCompetitor: p.hasNoCompetitor,
          isSurprise: p.isSurprise,
          isFavorite: p.isFavorite
        })),
        raceAnalysis: prediction.raceAnalysis,
        withdrawals: prediction.withdrawals,
        nonRunners: prediction.nonRunners,
        noCompetitorHorse: prediction.noCompetitorHorse,
        surpriseHorses: prediction.surpriseHorses
      })

      // Collect all data
      prediction.predictions.forEach((p, i) => {
        allPredictions.push({
          ...p,
          raceNumber: race.number,
          raceName: race.name,
          position: i + 1
        })
      })
      
      allWithdrawals.push(...prediction.withdrawals)
      allNonRunners.push(...prediction.nonRunners)
      allSurprises.push(...prediction.surpriseHorses)
    }

    // Sort by power score
    allPredictions.sort((a, b) => b.powerScore - a.powerScore)

    const napPick = allPredictions[0]
    const nextBestPick = allPredictions[1] || allPredictions[0]
    const valuePickHorse = allPredictions.slice(0, 10).find(p => 
      p.valueRating === 'Excellent' || p.valueRating === 'Good'
    ) || allPredictions[2] || allPredictions[0]

    const reportData = {
      racecourse: raceDayData.racecourse,
      country: raceDayData.country,
      date: raceDayData.date,
      totalRaces: raceDayData.races.length,
      races: racePredictions.map(rp => ({
        ...rp,
        predictions: rp.predictions.map(p => ({ ...p, strengths: p.strengths || [], concerns: p.concerns || [] }))
      })),
      napOfTheDay: {
        horseName: `${napPick.number}. ${napPick.name}`,
        raceName: napPick.raceName,
        reason: `Power Score: ${napPick.powerScore} | Win: ${napPick.winProbability.toFixed(1)}% | الفارس: ${napPick.jockey}${napPick.hasNoCompetitor ? ' | 🏆 بدون منافس' : ''}${napPick.isSurprise ? ' | ⚠️ مفاجأة' : ''}`,
        confidence: napPick.hasNoCompetitor ? 100 : Math.min(99, Math.round(napPick.winProbability * 2.5 + napPick.powerScore / 2))
      },
      nextBest: {
        horseName: `${nextBestPick.number}. ${nextBestPick.name}`,
        raceName: nextBestPick.raceName,
        reason: `Power Score: ${nextBestPick.powerScore} | الفارس: ${nextBestPick.jockey}`
      },
      valuePick: {
        horseName: `${valuePickHorse.number}. ${valuePickHorse.name}`,
        raceName: valuePickHorse.raceName,
        reason: `Value: ${valuePickHorse.valueRating} | Power: ${valuePickHorse.powerScore}`
      },
      generatedAt: new Date().toLocaleString('ar-AE', { timeZone: 'Asia/Dubai' }),
      withdrawals: allWithdrawals,
      nonRunners: allNonRunners,
      surprises: allSurprises
    }

    const pdfResult = await pdfGenerator.generateReport(reportData)
    
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
    }

    const racecourseInfo = RACECOURSES.UAE.find(r => r.name === normalizedName)

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
      sources: raceDayData.sources,
      pdfPath: pdfResult.success ? pdfResult.pdfPath : null,
      pdfGenerated: pdfResult.success,
      emailSent,
      liveStreamUrl: racecourseInfo?.liveStreamUrl || null,
      withdrawals: allWithdrawals,
      nonRunners: allNonRunners,
      surprises: allSurprises,
      availableRacecourses: getRacecoursesByCountry()
    })

  } catch (error) {
    console.error('[API v3.0] Error:', error)
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء معالجة الطلب',
      racecourse: '', date: '', totalRaces: 0, races: [],
      napOfTheDay: { horseName: '', raceName: '', reason: '', confidence: 0 },
      nextBest: { horseName: '', raceName: '', reason: '' },
      valuePick: { horseName: '', raceName: '', reason: '' },
      sources: [],
      availableRacecourses: getRacecoursesByCountry()
    }, { status: 500 })
  }
}

export async function GET() {
  const availableDates = [...new Set(UAE_RACES.map(r => r.date))].sort()
  return NextResponse.json({
    success: true,
    racecourses: getRacecoursesByCountry(),
    availableDates,
    message: 'Available racecourses retrieved successfully'
  })
}

function getRacecoursesByCountry(): Record<string, { name: string; city: string }[]> {
  const result: Record<string, { name: string; city: string }[]> = {}
  for (const [country, courses] of Object.entries(RACECOURSES)) {
    result[country] = courses.map(c => ({ name: c.name, city: c.city }))
  }
  return result
}
