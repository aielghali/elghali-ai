'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  CalendarIcon,
  Loader2,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Globe,
  Download,
  Mail,
  Play,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  ChevronDown,
  Send,
  RefreshCw,
  BarChart3,
  Target,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// Types
interface HorsePrediction {
  number: number
  name: string
  jockey: string
  trainer: string
  rating: number
  powerScore: number
  winProbability: number
  placeProbability: number
  draw: number
  weight: number
  form: string
  analysis: string
  strengths: string[]
  concerns: string[]
  valueRating: string
  raceName?: string
  raceNumber?: number
}

interface RaceData {
  raceNumber: number
  raceName: string
  raceTime: string
  surface: string
  distance: number
  predictions: HorsePrediction[]
  going?: string
  raceAnalysis?: string
}

interface PredictionResult {
  success: boolean
  message: string
  racecourse: string
  country: string
  date: string
  totalRaces: number
  races: RaceData[]
  napOfTheDay: {
    horseName: string
    raceName: string
    reason: string
    confidence: number
  }
  nextBest: {
    horseName: string
    raceName: string
    reason: string
  }
  valuePick: {
    horseName: string
    raceName: string
    reason: string
  }
  sources: string[]
  pdfPath: string | null
  pdfGenerated: boolean
  emailSent: boolean
  liveStreamUrl: string | null
  availableRacecourses: Record<string, { name: string; city: string }[]>
}

export default function Home() {
  // Language state
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isArabic = lang === 'ar'
  const dir = isArabic ? 'rtl' : 'ltr'

  // Form state
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [country, setCountry] = useState<string>('UAE')
  const [racecourse, setRacecourse] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [sendEmail, setSendEmail] = useState<boolean>(false)

  // UI state
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState('')
  const [availableRacecourses, setAvailableRacecourses] = useState<Record<string, { name: string; city: string }[]>>({})
  const [selectedRace, setSelectedRace] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // Text translations
  const text = {
    title: isArabic ? 'Elghali AI' : 'Elghali AI',
    subtitle: isArabic ? 'ترشيحات سباقات الخيل الذكية' : 'Smart Horse Racing Predictions',
    welcome: isArabic ? 'مرحباً بك في Elghali AI' : 'Welcome to Elghali AI',
    desc: isArabic ? 'نظام الذكاء الاصطناعي لتحليل سباقات الخيل' : 'AI System for Horse Racing Analysis',
    dateLabel: isArabic ? 'تاريخ السباق' : 'Race Date',
    countryLabel: isArabic ? 'الدولة' : 'Country',
    raceLabel: isArabic ? 'المضمار' : 'Racecourse',
    emailLabel: isArabic ? 'البريد الإلكتروني' : 'Email',
    sendEmailLabel: isArabic ? 'إرسال التقرير بالبريد' : 'Send Report via Email',
    start: isArabic ? 'بدء التحليل' : 'Start Analysis',
    processing: isArabic ? 'جاري المعالجة...' : 'Processing...',
    success: isArabic ? 'تم بنجاح!' : 'Success!',
    errorTitle: isArabic ? 'خطأ' : 'Error',
    nap: isArabic ? 'ترشيح اليوم' : 'NAP of the Day',
    races: isArabic ? 'سباقات' : 'Races',
    copyright: isArabic ? '© 2025 Elghali AI - جميع الحقوق محفوظة' : '© 2025 Elghali AI - All Rights Reserved',
    downloadPdf: isArabic ? 'تحميل PDF' : 'Download PDF',
    liveStream: isArabic ? 'البث المباشر' : 'Live Stream',
    selectCountry: isArabic ? 'اختر الدولة' : 'Select Country',
    selectRacecourse: isArabic ? 'اختر المضمار' : 'Select Racecourse',
    allRaces: isArabic ? 'جميع السباقات' : 'All Races',
    powerScore: isArabic ? 'القوة' : 'Power Score',
    winProb: isArabic ? 'احتمال الفوز' : 'Win %',
    valueRating: isArabic ? 'القيمة' : 'Value',
    nextBest: isArabic ? 'الترشيح الثاني' : 'Next Best',
    valuePick: isArabic ? 'ترشيح القيمة' : 'Value Pick',
    feedbackTitle: isArabic ? 'ملاحظاتك' : 'Your Feedback',
    feedbackPlaceholder: isArabic ? 'شاركنا ملاحظاتك حول الترشيحات...' : 'Share your feedback on predictions...',
    sendFeedback: isArabic ? 'إرسال الملاحظات' : 'Send Feedback',
    thanksFeedback: isArabic ? 'شكراً لملاحظاتك!' : 'Thanks for your feedback!',
    analysis: isArabic ? 'التحليل' : 'Analysis',
    strengths: isArabic ? 'نقاط القوة' : 'Strengths',
    concerns: isArabic ? 'نقاط الضعف' : 'Concerns',
    sources: isArabic ? 'المصادر' : 'Sources',
    newAnalysis: isArabic ? 'تحليل جديد' : 'New Analysis',
    raceNumber: isArabic ? 'السباق' : 'Race',
    distance: isArabic ? 'المسافة' : 'Distance',
    surface: isArabic ? 'السطح' : 'Surface',
    going: isArabic ? 'حالة الأرض' : 'Going',
    draw: isArabic ? 'البوابة' : 'Draw',
    rating: isArabic ? 'التقييم' : 'Rating',
    features: {
      title: isArabic ? 'مميزات النظام' : 'System Features',
      f1: isArabic ? 'تحليل متقدم بـ 15+ عامل' : 'Advanced Analysis with 15+ Factors',
      f2: isArabic ? 'بيانات حقيقية من المصادر' : 'Real Data from Sources',
      f3: isArabic ? 'تقارير PDF احترافية' : 'Professional PDF Reports',
      f4: isArabic ? 'دعم اللغة العربية' : 'Arabic Language Support'
    }
  }

  // Fetch available racecourses on mount
  useEffect(() => {
    fetch('/api/predictions')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.racecourses) {
          setAvailableRacecourses(data.racecourses)
        }
      })
      .catch(err => console.error('Failed to fetch racecourses:', err))
  }, [])

  // Update racecourse when country changes
  useEffect(() => {
    if (availableRacecourses[country] && availableRacecourses[country].length > 0) {
      setRacecourse(availableRacecourses[country][0].name)
    }
  }, [country, availableRacecourses])

  // Main submit handler
  const handleSubmit = async () => {
    if (!date || !racecourse) {
      setError(isArabic ? 'جميع الحقول مطلوبة' : 'All fields required')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setSelectedRace(0)

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: format(date, 'yyyy-MM-dd'),
          racecourse: racecourse.trim(),
          email: email.trim(),
          sendEmail
        })
      })

      const data = await res.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.message || (isArabic ? 'حدث خطأ' : 'Error occurred'))
      }
    } catch (err) {
      setError(isArabic ? 'خطأ في الاتصال' : 'Connection error')
    } finally {
      setLoading(false)
    }
  }

  // Handle PDF download
  const handleDownloadPdf = () => {
    if (result?.pdfPath) {
      const filename = result.pdfPath.split('/').pop()
      window.open(`/download/${filename}`, '_blank')
    }
  }

  // Handle feedback submission
  const handleFeedbackSubmit = () => {
    if (feedback.trim()) {
      console.log('Feedback submitted:', feedback)
      setFeedbackSubmitted(true)
      setFeedback('')
    }
  }

  // Get flag emoji for country
  const getCountryFlag = (countryCode: string): string => {
    const flags: Record<string, string> = {
      'UAE': '🇦🇪',
      'UK': '🇬🇧',
      'IRELAND': '🇮🇪',
      'AUSTRALIA': '🇦🇺',
      'USA': '🇺🇸',
      'FRANCE': '🇫🇷',
      'SAUDI_ARABIA': '🇸🇦',
      'QATAR': '🇶🇦',
      'BAHRAIN': '🇧🇭'
    }
    return flags[countryCode] || '🏁'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-red-50" dir={dir}>
      {/* Header */}
      <header className="bg-gradient-to-l from-red-900 via-red-800 to-red-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center text-3xl shadow-lg">
                🐎
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-amber-400">{text.title}</h1>
                <p className="text-amber-200 text-sm">{text.subtitle}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setLang(isArabic ? 'en' : 'ar')}
              className="text-amber-200 hover:text-amber-400"
            >
              <Globe className="w-4 h-4 mr-2" />
              {isArabic ? 'English' : 'العربية'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Card */}
        <Card className="mb-6 border-amber-200 bg-gradient-to-l from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-900 rounded-lg">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-900">{text.welcome}</h2>
                <p className="text-gray-600">{text.desc}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <Card className="mb-6 shadow-lg border-amber-200">
          <CardHeader className="bg-gradient-to-l from-red-900 to-red-800 text-white rounded-t-lg">
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <Target className="w-5 h-5" />
              {isArabic ? 'إدخال بيانات السباق' : 'Race Information'}
            </CardTitle>
            <CardDescription className="text-amber-200">
              {isArabic ? 'حدد التاريخ والمضمار للحصول على الترشيحات' : 'Select date and racecourse to get predictions'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label className="text-red-900 font-bold flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {text.dateLabel}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-white">
                      {date ? format(date, 'yyyy-MM-dd') : (isArabic ? 'اختر التاريخ' : 'Select date')}
                      <CalendarIcon className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Country Selector */}
              <div className="space-y-2">
                <Label className="text-red-900 font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {text.countryLabel}
                </Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={text.selectCountry} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(availableRacecourses).map(c => (
                      <SelectItem key={c} value={c}>
                        {getCountryFlag(c)} {c.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Racecourse Selector */}
              <div className="space-y-2">
                <Label className="text-red-900 font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {text.raceLabel}
                </Label>
                <Select value={racecourse} onValueChange={setRacecourse}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={text.selectRacecourse} />
                  </SelectTrigger>
                  <SelectContent>
                    {(availableRacecourses[country] || []).map(rc => (
                      <SelectItem key={rc.name} value={rc.name}>
                        {rc.name} - {rc.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-red-900 font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {text.emailLabel}
                </Label>
                <div className="space-y-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="bg-white border-amber-200"
                    dir="ltr"
                  />
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="rounded"
                    />
                    {text.sendEmailLabel}
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-l from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white py-6 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {text.processing}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {text.start}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>{text.errorTitle}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {result && result.success && (
          <div className="space-y-6">
            {/* Success Header */}
            <Card className="shadow-lg border-amber-200">
              <CardHeader className="bg-gradient-to-l from-green-700 to-green-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {text.success}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-400 text-red-900">
                      {result.totalRaces} {text.races}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setResult(null)
                        setError('')
                      }}
                      className="text-white border-white hover:bg-white/20"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      {text.newAnalysis}
                    </Button>
                  </div>
                </div>
                <p className="text-green-200 text-sm mt-1">
                  {result.racecourse} - {result.date} ({result.country})
                </p>
              </CardHeader>
            </Card>

            {/* NAP Section */}
            <Card className="border-2 border-amber-400 bg-gradient-to-l from-amber-50 to-amber-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  <h3 className="font-bold text-red-900 text-lg">{text.nap}</h3>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-700 mb-2">{result.napOfTheDay.horseName}</p>
                  <p className="text-gray-600 mb-2">{result.napOfTheDay.raceName}</p>
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <Badge className="bg-green-600 text-white text-base px-4 py-1">
                      {result.napOfTheDay.confidence}% {isArabic ? 'ثقة' : 'Confidence'}
                    </Badge>
                  </div>
                  <p className="text-gray-700">{result.napOfTheDay.reason}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Picks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    {text.nextBest}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold text-lg">{result.nextBest.horseName}</p>
                  <p className="text-sm text-gray-600">{result.nextBest.raceName}</p>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    {text.valuePick}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold text-lg">{result.valuePick.horseName}</p>
                  <p className="text-sm text-gray-600">{result.valuePick.raceName}</p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {result.pdfGenerated && (
                <Button
                  onClick={handleDownloadPdf}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {text.downloadPdf}
                </Button>
              )}
              {result.liveStreamUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(result.liveStreamUrl!, '_blank')}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {text.liveStream}
                </Button>
              )}
            </div>

            {/* Race Tabs */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-l from-red-900 to-red-800 text-white rounded-t-lg pb-3">
                <CardTitle className="text-amber-400 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {text.allRaces}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="race-0" className="w-full">
                  <TabsList className="w-full justify-start bg-gray-100 rounded-none p-0 h-auto flex-wrap">
                    {result.races.map((race, i) => (
                      <TabsTrigger
                        key={i}
                        value={`race-${i}`}
                        className="px-4 py-2 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-amber-500"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {race.raceTime}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {result.races.map((race, i) => (
                    <TabsContent key={i} value={`race-${i}`} className="p-4 mt-0">
                      {/* Race Info */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="text-red-700 border-red-300">
                          {race.raceName}
                        </Badge>
                        <Badge variant="outline">
                          {race.distance}m
                        </Badge>
                        <Badge variant="outline">
                          {race.surface}
                        </Badge>
                        {race.going && (
                          <Badge variant="outline">
                            {race.going}
                          </Badge>
                        )}
                      </div>

                      {/* Predictions Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="p-2 text-right text-sm font-bold text-red-900">Pos</th>
                              <th className="p-2 text-right text-sm font-bold text-red-900">{isArabic ? 'الحصان' : 'Horse'}</th>
                              <th className="p-2 text-right text-sm font-bold text-red-900">{text.draw}</th>
                              <th className="p-2 text-right text-sm font-bold text-red-900">{isArabic ? 'الفارس' : 'Jockey'}</th>
                              <th className="p-2 text-right text-sm font-bold text-red-900">{text.rating}</th>
                              <th className="p-2 text-right text-sm font-bold text-red-900">{text.powerScore}</th>
                              <th className="p-2 text-right text-sm font-bold text-red-900">{text.winProb}</th>
                              <th className="p-2 text-right text-sm font-bold text-red-900">{text.valueRating}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {race.predictions.slice(0, 5).map((horse, j) => (
                              <tr
                                key={j}
                                className={cn(
                                  "border-b",
                                  j === 0 && "bg-amber-50",
                                  j === 1 && "bg-gray-50",
                                  j === 2 && "bg-orange-50"
                                )}
                              >
                                <td className="p-2">
                                  <span className={cn(
                                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-bold",
                                    j === 0 && "bg-amber-500",
                                    j === 1 && "bg-gray-400",
                                    j === 2 && "bg-orange-400",
                                    j > 2 && "bg-gray-300"
                                  )}>
                                    {j + 1}
                                  </span>
                                </td>
                                <td className="p-2 font-bold">{horse.name}</td>
                                <td className="p-2">{horse.draw}</td>
                                <td className="p-2 text-sm">{horse.jockey}</td>
                                <td className="p-2">{horse.rating}</td>
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    <Progress value={horse.powerScore} className="w-12 h-2" />
                                    <span className="font-bold text-red-700">{horse.powerScore.toFixed(1)}</span>
                                  </div>
                                </td>
                                <td className="p-2 text-green-600 font-semibold">
                                  {horse.winProbability.toFixed(1)}%
                                </td>
                                <td className="p-2">
                                  <Badge className={cn(
                                    "text-xs",
                                    horse.valueRating === 'Excellent' && "bg-green-600",
                                    horse.valueRating === 'Good' && "bg-blue-600",
                                    horse.valueRating === 'Fair' && "bg-yellow-600",
                                    horse.valueRating === 'Poor' && "bg-gray-400"
                                  )}>
                                    {horse.valueRating}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Horse Details Accordion */}
                      <Accordion type="single" collapsible className="mt-4">
                        {race.predictions.slice(0, 3).map((horse, j) => (
                          <AccordionItem key={j} value={`horse-${j}`}>
                            <AccordionTrigger className="hover:bg-gray-50 px-3">
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "w-5 h-5 rounded-full text-white text-xs flex items-center justify-center",
                                  j === 0 && "bg-amber-500",
                                  j === 1 && "bg-gray-400",
                                  j === 2 && "bg-orange-400"
                                )}>
                                  {j + 1}
                                </span>
                                <span className="font-bold">{horse.name}</span>
                                <span className="text-sm text-gray-500">- {horse.jockey}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-3">
                              <div className="space-y-3">
                                {horse.strengths.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-green-700 mb-1">{text.strengths}:</p>
                                    <ul className="text-sm text-gray-600 list-disc list-inside">
                                      {horse.strengths.map((s, k) => (
                                        <li key={k}>{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {horse.concerns.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-red-700 mb-1">{text.concerns}:</p>
                                    <ul className="text-sm text-gray-600 list-disc list-inside">
                                      {horse.concerns.map((c, k) => (
                                        <li key={k}>{c}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div><strong>{isArabic ? 'المدرب:' : 'Trainer:'}</strong> {horse.trainer}</div>
                                  <div><strong>{isArabic ? 'الوزن:' : 'Weight:'}</strong> {horse.weight}kg</div>
                                  <div><strong>{isArabic ? 'الشكل:' : 'Form:'}</strong> {horse.form || 'N/A'}</div>
                                  <div><strong>{isArabic ? 'احتمال المركز:' : 'Place %:'}</strong> {horse.placeProbability.toFixed(1)}%</div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Sources */}
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <strong>{text.sources}:</strong>
                  <span>{result.sources.join(' | ')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {text.feedbackTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedbackSubmitted ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    {text.thanksFeedback}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={text.feedbackPlaceholder}
                      rows={3}
                    />
                    <Button onClick={handleFeedbackSubmit} disabled={!feedback.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      {text.sendFeedback}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Section */}
        {!result && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: '📊', title: text.features.f1 },
              { icon: '🌐', title: text.features.f2 },
              { icon: '📄', title: text.features.f3 },
              { icon: '🔤', title: text.features.f4 }
            ].map((item, i) => (
              <Card key={i} className="border-amber-200 text-center">
                <CardContent className="pt-4">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-sm font-medium text-red-900">{item.title}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-red-900 text-white py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-amber-200">{text.copyright}</p>
          <p className="text-xs text-red-300 mt-2">
            ⚠️ {isArabic 
              ? 'هذه الترشيحات للترفيه فقط. المراهنة تنطوي على مخاطر.' 
              : 'These predictions are for entertainment only. Betting involves risks.'}
          </p>
        </div>
      </footer>
    </div>
  )
}
