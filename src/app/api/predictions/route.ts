import { NextRequest, NextResponse } from 'next/server'
import { getRealRaceData, generatePredictionsFromData } from '@/lib/real-race-data'

// Fallback sample data for when real data is not available
const SAMPLE_HORSES: Record<string, { name: string; jockey: string; trainer: string }[]> = {
  'Meydan': [
    { name: 'Dividend', jockey: 'Rossa Ryan', trainer: 'Dr R Newland' },
    { name: 'Masai Moon', jockey: 'W Buick', trainer: 'C Appleby' },
    { name: 'Desert Wisdom', jockey: 'J Crowley', trainer: 'A Al Mheiri' },
  ],
  'Jebel Ali': [
    { name: 'AF Al Sajl', jockey: "T O'Shea", trainer: 'K Al Neyadi' },
    { name: 'Al Jaddaf', jockey: 'A De Vries', trainer: 'D Watson' },
    { name: 'Qareem', jockey: 'P Dobbs', trainer: 'M Al Shemalli' },
  ],
  'Abu Dhabi': [
    { name: 'AF Aljebel', jockey: "T O'Shea", trainer: 'K Al Neyadi' },
    { name: 'Mubasher', jockey: 'A Al Balushi', trainer: 'M Al Mheiri' },
    { name: 'Hajres', jockey: 'S Al Balushi', trainer: 'A Al Hajri' },
  ],
  'Al Ain': [
    { name: 'Jadhab', jockey: 'A Al Balushi', trainer: 'K Al Neyadi' },
    { name: 'Moukhb', jockey: 'S Al Balushi', trainer: 'A Al Hajri' },
    { name: 'Muthana', jockey: 'T O Shea', trainer: 'D Watson' },
  ],
  'Sharjah': [
    { name: 'Areem', jockey: 'A Al Balushi', trainer: 'K Al Neyadi' },
    { name: 'Swaiff', jockey: 'S Al Balushi', trainer: 'A Al Hajri' },
    { name: 'Hazza', jockey: 'T O Shea', trainer: 'D Watson' },
  ],
}

interface HorsePrediction {
  position: number
  horseName: string
  draw: number
  jockey: string
  trainer: string
  rating: string
  winProbability: string
  analysis: string
}

interface RacePrediction {
  raceNumber: number
  raceName: string
  raceTime: string
  surface: string
  distance: number
  predictions: HorsePrediction[]
  valuePick?: { horse: string; draw: number; reason: string }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, racecourse, email } = body

    // Validate required fields
    if (!date || !racecourse || !email) {
      return NextResponse.json({
        success: false,
        message: 'جميع الحقول مطلوبة',
        racecourse: racecourse || '',
        date: date || '',
        totalRaces: 0,
        predictions: [],
        napOfTheDay: { horseName: '', raceName: '', reason: '' },
        nextBest: { horseName: '', raceName: '', reason: '' },
        sources: []
      }, { status: 400 })
    }

    // Validate email
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json({
        success: false,
        message: 'البريد الإلكتروني غير صحيح',
        racecourse,
        date,
        totalRaces: 0,
        predictions: [],
        napOfTheDay: { horseName: '', raceName: '', reason: '' },
        nextBest: { horseName: '', raceName: '', reason: '' },
        sources: []
      }, { status: 400 })
    }

    console.log(`[Predictions] Racecourse: ${racecourse}, Date: ${date}`)

    // Normalize racecourse name
    const normalizeRacecourse = (name: string): string => {
      const lower = name.toLowerCase()
      const specialCases: Record<string, string> = {
        'al ain': 'Al Ain',
        'al-ain': 'Al Ain',
        'alain': 'Al Ain',
        'meydan': 'Meydan',
        'jebel ali': 'Jebel Ali',
        'jebel-ali': 'Jebel Ali',
        'abu dhabi': 'Abu Dhabi',
        'abu-dhabi': 'Abu Dhabi',
        'abudhabi': 'Abu Dhabi',
        'sharjah': 'Sharjah',
      }
      return specialCases[lower] || name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    }
    const normalizedRacecourse = normalizeRacecourse(racecourse)

    let predictions: RacePrediction[] = []
    let dataSource = 'Sample Data'

    // Try to get real race data
    try {
      const realData = await getRealRaceData(normalizedRacecourse, date)
      
      if (realData && realData.races.length > 0) {
        predictions = generatePredictionsFromData(realData)
        dataSource = 'Emirates Racing Authority / Racing Sources'
        console.log(`[Predictions] Generated ${predictions.length} race predictions from real data`)
      }
    } catch (error) {
      console.error('[Predictions] Error fetching real data:', error)
    }

    // Fallback to sample data if real data not available
    if (predictions.length === 0) {
      const horses = SAMPLE_HORSES[normalizedRacecourse] || SAMPLE_HORSES['Meydan']
      predictions = [{
        raceNumber: 1,
        raceName: `Race 1 - ${normalizedRacecourse}`,
        raceTime: '17:00',
        surface: 'Dirt',
        distance: 1400,
        predictions: horses.slice(0, 3).map((h, i) => ({
          position: i + 1,
          horseName: h.name,
          draw: i + 1,
          jockey: h.jockey,
          trainer: h.trainer,
          rating: String(75 - i * 5),
          winProbability: `${45 - i * 12}%`,
          analysis: i === 0 ? 'مرشح قوي' : i === 1 ? 'منافس قوي' : 'خيار جيد'
        }))
      }]
      dataSource = 'Sample Data (لم يتم العثور على بيانات حقيقية)'
    }

    // Generate NAP and Next Best
    const napHorse = predictions[0]?.predictions[0]
    const nextBestHorse = predictions[0]?.predictions[1] || predictions[1]?.predictions[0]

    return NextResponse.json({
      success: true,
      message: `تم تحليل ${predictions.length} سباق في ${normalizedRacecourse} بنجاح`,
      racecourse: normalizedRacecourse,
      date,
      totalRaces: predictions.length,
      predictions,
      napOfTheDay: napHorse ? {
        horseName: napHorse.horseName,
        raceName: predictions[0].raceName,
        reason: `أفضل ترشيح - الفارس ${napHorse.jockey} - التصنيف ${napHorse.rating}`
      } : { horseName: '', raceName: '', reason: '' },
      nextBest: nextBestHorse ? {
        horseName: nextBestHorse.horseName,
        raceName: predictions[0]?.raceName || '',
        reason: `ترشيح ثانٍ - الفارس ${nextBestHorse.jockey}`
      } : { horseName: '', raceName: '', reason: '' },
      sources: [dataSource, 'Elghali AI Analysis'],
      emailSent: false
    })

  } catch (error) {
    console.error('[Predictions] Error:', error)
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ. حاول مرة أخرى.',
      racecourse: '',
      date: '',
      totalRaces: 0,
      predictions: [],
      napOfTheDay: { horseName: '', raceName: '', reason: '' },
      nextBest: { horseName: '', raceName: '', reason: '' },
      sources: []
    }, { status: 500 })
  }
}
