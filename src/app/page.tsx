'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  CalendarIcon, Loader2, Trophy, CheckCircle2, AlertCircle, Globe, Download,
  Mail, Play, Star, TrendingUp, Clock, MapPin, Send, RefreshCw, BarChart3,
  Target, Sparkles, AlertTriangle, Ban, Zap, Crown, ExternalLink
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface HorsePrediction {
  position: number
  number: number
  name: string
  draw: number
  jockey: string
  trainer: string
  rating: number
  powerScore: number
  winProbability: number
  placeProbability: number
  valueRating: string
  form: string
  weight: number
  strengths: string[]
  concerns: string[]
  analysis: string
  isWithdrawn?: boolean
  isNonRunner?: boolean
  hasNoCompetitor?: boolean
  isSurprise?: boolean
  isFavorite?: boolean
}

interface RaceData {
  raceNumber: number
  raceName: string
  raceTime: string
  surface: string
  distance: number
  going: string
  predictions: HorsePrediction[]
  raceAnalysis?: string
  withdrawals?: string[]
  nonRunners?: string[]
  noCompetitorHorse?: string
  surpriseHorses?: string[]
}

interface PredictionResult {
  success: boolean
  message: string
  racecourse: string
  country: string
  date: string
  totalRaces: number
  races: RaceData[]
  napOfTheDay: { horseName: string; raceName: string; reason: string; confidence: number }
  nextBest: { horseName: string; raceName: string; reason: string }
  valuePick: { horseName: string; raceName: string; reason: string }
  sources: string[]
  pdfPath: string | null
  pdfGenerated: boolean
  emailSent: boolean
  liveStreamUrl: string | null
  withdrawals?: string[]
  nonRunners?: string[]
  surprises?: string[]
  availableRacecourses: Record<string, { name: string; city: string }[]>
}

export default function Home() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isArabic = lang === 'ar'
  const dir = isArabic ? 'rtl' : 'ltr'

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [country, setCountry] = useState<string>('UAE')
  const [racecourse, setRacecourse] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [sendEmailChecked, setSendEmailChecked] = useState<boolean>(false)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState('')
  const [availableRacecourses, setAvailableRacecourses] = useState<Record<string, { name: string; city: string }[]>>({})
  const [feedback, setFeedback] = useState<string>('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('predictions')

  const text = {
    title: 'Elghali AI',
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
    powerScore: isArabic ? 'القوة' : 'Power',
    winProb: isArabic ? 'احتمال الفوز' : 'Win %',
    valueRating: isArabic ? 'القيمة' : 'Value',
    nextBest: isArabic ? 'الترشيح الثاني' : 'Next Best',
    valuePick: isArabic ? 'ترشيح القيمة' : 'Value Pick',
    feedbackTitle: isArabic ? 'ملاحظاتك' : 'Your Feedback',
    feedbackPlaceholder: isArabic ? 'شاركنا ملاحظاتك حول الترشيحات...' : 'Share your feedback on predictions...',
    sendFeedback: isArabic ? 'إرسال الملاحظات' : 'Send Feedback',
    thanksFeedback: isArabic ? 'شكراً لملاحظاتك!' : 'Thanks for your feedback!',
    newAnalysis: isArabic ? 'تحليل جديد' : 'New Analysis',
    strengths: isArabic ? 'نقاط القوة' : 'Strengths',
    concerns: isArabic ? 'نقاط الضعف' : 'Concerns',
    sources: isArabic ? 'المصادر' : 'Sources',
    horse: isArabic ? 'الحصان' : 'Horse',
    jockey: isArabic ? 'الفارس' : 'Jockey',
    trainer: isArabic ? 'المدرب' : 'Trainer',
    horseNumber: isArabic ? 'رقم الحصان' : 'Horse #',
    draw: isArabic ? 'البوابة' : 'Draw',
    rating: isArabic ? 'التقييم' : 'Rating',
    withdrawals: isArabic ? 'المنسحبون' : 'Withdrawals',
    nonRunners: isArabic ? 'غير المشاركين' : 'Non-Runners',
    surprises: isArabic ? 'المفاجآت المحتملة' : 'Potential Surprises',
    noCompetitor: isArabic ? 'بدون منافس - فوز تلقائي' : 'No Competitor - Automatic Win',
    tabs: {
      predictions: isArabic ? 'الترشيحات' : 'Predictions',
      calendar: isArabic ? 'التقويم' : 'Calendar',
      live: isArabic ? 'البث المباشر' : 'Live Stream'
    },
    features: {
      f1: isArabic ? 'تحليل متقدم بـ 17+ عامل' : 'Advanced Analysis with 17+ Factors',
      f2: isArabic ? 'بيانات حقيقية من المصادر' : 'Real Data from Sources',
      f3: isArabic ? 'تقارير PDF احترافية' : 'Professional PDF Reports',
      f4: isArabic ? 'دعم اللغة العربية' : 'Arabic Language Support',
      f5: isArabic ? 'إرسال بالبريد الإلكتروني' : 'Email Delivery',
      f6: isArabic ? 'البث المباشر للسباقات' : 'Live Race Streaming'
    }
  }

  useEffect(() => {
    fetch('/api/predictions')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.racecourses) setAvailableRacecourses(data.racecourses)
      })
      .catch(err => console.error('Failed to fetch racecourses:', err))
  }, [])

  useEffect(() => {
    if (availableRacecourses[country] && availableRacecourses[country].length > 0) {
      setRacecourse(availableRacecourses[country][0].name)
    }
  }, [country, availableRacecourses])

  const handleSubmit = async () => {
    if (!date || !racecourse) {
      setError(isArabic ? 'جميع الحقول مطلوبة' : 'All fields required')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: format(date, 'yyyy-MM-dd'),
          racecourse: racecourse.trim(),
          email: email.trim(),
          sendEmail: sendEmailChecked
        })
      })

      const data = await res.json()
      if (data.success) {
        setResult(data)
        setActiveTab('predictions')
      } else {
        setError(data.message || (isArabic ? 'حدث خطأ' : 'Error occurred'))
      }
    } catch (err) {
      setError(isArabic ? 'خطأ في الاتصال' : 'Connection error')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = () => {
    if (result?.pdfPath) {
      const filename = result.pdfPath.split('/').pop()
      window.open(`/download/${filename}`, '_blank')
    }
  }

  const handleFeedbackSubmit = () => {
    if (feedback.trim()) {
      setFeedbackSubmitted(true)
      setFeedback('')
    }
  }

  const getCountryFlag = (countryCode: string): string => {
    const flags: Record<string, string> = {
      'UAE': '🇦🇪', 'UK': '🇬🇧', 'IRELAND': '🇮🇪', 'AUSTRALIA': '🇦🇺', 'USA': '🇺🇸',
      'FRANCE': '🇫🇷', 'SAUDI_ARABIA': '🇸🇦', 'QATAR': '🇶🇦', 'BAHRAIN': '🇧🇭'
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
              <div className="w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center text-3xl shadow-lg">🐎</div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-amber-400">{text.title}</h1>
                <p className="text-amber-200 text-sm">{text.subtitle}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setLang(isArabic ? 'en' : 'ar')} className="text-amber-200 hover:text-amber-400">
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
              <div className="p-3 bg-red-900 rounded-lg"><Trophy className="w-6 h-6 text-amber-400" /></div>
              <div>
                <h2 className="text-xl font-bold text-red-900">{text.welcome}</h2>
                <p className="text-gray-600">{text.desc}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-red-100">
            <TabsTrigger value="predictions" className="data-[state=active]:bg-red-900 data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-2" />{text.tabs.predictions}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-red-900 data-[state=active]:text-white">
              <CalendarIcon className="w-4 h-4 mr-2" />{text.tabs.calendar}
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-red-900 data-[state=active]:text-white">
              <Play className="w-4 h-4 mr-2" />{text.tabs.live}
            </TabsTrigger>
          </TabsList>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="mt-4">
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
                      <CalendarIcon className="w-4 h-4" />{text.dateLabel}
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
                      <Globe className="w-4 h-4" />{text.countryLabel}
                    </Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder={text.selectCountry} /></SelectTrigger>
                      <SelectContent>
                        {Object.keys(availableRacecourses).map(c => (
                          <SelectItem key={c} value={c}>{getCountryFlag(c)} {c.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Racecourse Selector */}
                  <div className="space-y-2">
                    <Label className="text-red-900 font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />{text.raceLabel}
                    </Label>
                    <Select value={racecourse} onValueChange={setRacecourse}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder={text.selectRacecourse} /></SelectTrigger>
                      <SelectContent>
                        {(availableRacecourses[country] || []).map(rc => (
                          <SelectItem key={rc.name} value={rc.name}>{rc.name} - {rc.city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-red-900 font-bold flex items-center gap-2">
                      <Mail className="w-4 h-4" />{text.emailLabel}
                    </Label>
                    <div className="space-y-2">
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com" className="bg-white border-amber-200" dir="ltr" />
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={sendEmailChecked} onChange={(e) => setSendEmailChecked(e.target.checked)} className="rounded" />
                        {text.sendEmailLabel}
                      </label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSubmit} disabled={loading}
                  className="w-full mt-6 bg-gradient-to-l from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white py-6 text-lg">
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" />{text.processing}</>
                  ) : (
                    <><Sparkles className="w-5 h-5 mr-2" />{text.start}</>
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

            {/* Results */}
            {result && result.success && (
              <div className="space-y-6">
                {/* Withdrawals/NonRunners Alert */}
                {(result.withdrawals && result.withdrawals.length > 0) && (
                  <Alert className="border-orange-300 bg-orange-50">
                    <Ban className="w-4 h-4 text-orange-600" />
                    <AlertTitle className="text-orange-800">{text.withdrawals}</AlertTitle>
                    <AlertDescription className="text-orange-700">
                      {result.withdrawals.join(' | ')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Surprises Alert */}
                {(result.surprises && result.surprises.length > 0) && (
                  <Alert className="border-purple-300 bg-purple-50">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <AlertTitle className="text-purple-800">{text.surprises}</AlertTitle>
                    <AlertDescription className="text-purple-700">
                      {result.surprises.join(' | ')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Success Header */}
                <Card className="shadow-lg border-amber-200">
                  <CardHeader className="bg-gradient-to-l from-green-700 to-green-600 text-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />{text.success}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-400 text-red-900">{result.totalRaces} {text.races}</Badge>
                        <Button variant="outline" size="sm" onClick={() => { setResult(null); setError('') }}
                          className="text-white border-white hover:bg-white/20">
                          <RefreshCw className="w-4 h-4 mr-1" />{text.newAnalysis}
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
                      <Crown className="w-6 h-6 text-amber-500" />
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
                        <TrendingUp className="w-4 h-4 text-blue-600" />{text.nextBest}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-lg">{result.nextBest.horseName}</p>
                      <p className="text-sm text-gray-600">{result.nextBest.raceName}</p>
                      <p className="text-xs text-gray-500 mt-1">{result.nextBest.reason}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-600" />{text.valuePick}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-lg">{result.valuePick.horseName}</p>
                      <p className="text-sm text-gray-600">{result.valuePick.raceName}</p>
                      <p className="text-xs text-gray-500 mt-1">{result.valuePick.reason}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {result.pdfGenerated && (
                    <Button onClick={handleDownloadPdf}
                      className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400">
                      <Download className="w-4 h-4 mr-2" />{text.downloadPdf}
                    </Button>
                  )}
                  {result.liveStreamUrl && (
                    <Button variant="outline" onClick={() => window.open(result.liveStreamUrl!, '_blank')}
                      className="border-red-300 text-red-700 hover:bg-red-50">
                      <Play className="w-4 h-4 mr-2" />{text.liveStream}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>

                {/* Race Tabs */}
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-l from-red-900 to-red-800 text-white rounded-t-lg pb-3">
                    <CardTitle className="text-amber-400 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />{text.allRaces}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Tabs defaultValue="race-0" className="w-full">
                      <TabsList className="w-full justify-start bg-gray-100 rounded-none p-0 h-auto flex-wrap">
                        {result.races.map((race, i) => (
                          <TabsTrigger key={i} value={`race-${i}`}
                            className="px-4 py-2 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-amber-500">
                            <Clock className="w-3 h-3 mr-1" />{race.raceTime}
                            {race.noCompetitorHorse && <Crown className="w-3 h-3 ml-1 text-amber-500" />}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {result.races.map((race, i) => (
                        <TabsContent key={i} value={`race-${i}`} className="p-4 mt-0">
                          {/* No Competitor Alert */}
                          {race.noCompetitorHorse && (
                            <Alert className="mb-4 border-amber-400 bg-amber-50">
                              <Crown className="w-4 h-4 text-amber-600" />
                              <AlertTitle className="text-amber-800">{text.noCompetitor}</AlertTitle>
                              <AlertDescription className="text-amber-700">
                                {race.noCompetitorHorse}
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Race Info */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="outline" className="text-red-700 border-red-300">{race.raceName}</Badge>
                            <Badge variant="outline">{race.distance}m</Badge>
                            <Badge variant="outline">{race.surface}</Badge>
                            {race.going && <Badge variant="outline">{race.going}</Badge>}
                          </div>

                          {/* Withdrawals for this race */}
                          {race.withdrawals && race.withdrawals.length > 0 && (
                            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <div className="flex items-center gap-2 text-orange-700 text-sm font-medium">
                                <Ban className="w-4 h-4" />{text.withdrawals}: {race.withdrawals.join(', ')}
                              </div>
                            </div>
                          )}

                          {/* Predictions Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="p-2 text-right text-sm font-bold text-red-900">#</th>
                                  <th className="p-2 text-right text-sm font-bold text-red-900">{text.horseNumber}</th>
                                  <th className="p-2 text-right text-sm font-bold text-red-900">{text.horse}</th>
                                  <th className="p-2 text-right text-sm font-bold text-red-900">{text.draw}</th>
                                  <th className="p-2 text-right text-sm font-bold text-red-900">{text.jockey}</th>
                                  <th className="p-2 text-right text-sm font-bold text-red-900">{text.rating}</th>
                                  <th className="p-2 text-right text-sm font-bold text-red-900">{text.powerScore}</th>
                                  <th className="p-2 text-right text-sm font-bold text-red-900">{text.winProb}</th>
                                  <th className="p-2 text-right text-sm font-bold text-red-900">{text.valueRating}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {race.predictions.slice(0, 5).map((horse, j) => (
                                  <tr key={j} className={cn(
                                    "border-b",
                                    horse.hasNoCompetitor && "bg-amber-100",
                                    !horse.hasNoCompetitor && j === 0 && "bg-amber-50",
                                    !horse.hasNoCompetitor && j === 1 && "bg-gray-50",
                                    !horse.hasNoCompetitor && j === 2 && "bg-orange-50"
                                  )}>
                                    <td className="p-2">
                                      <span className={cn(
                                        "inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-bold",
                                        horse.hasNoCompetitor ? "bg-amber-500" :
                                        j === 0 ? "bg-amber-500" : j === 1 ? "bg-gray-400" : j === 2 ? "bg-orange-400" : "bg-gray-300"
                                      )}>{j + 1}</span>
                                    </td>
                                    <td className="p-2">
                                      <span className="font-bold text-lg text-red-800">{horse.number}</span>
                                    </td>
                                    <td className="p-2 font-bold">
                                      {horse.name}
                                      {horse.isSurprise && <Zap className="w-4 h-4 inline ml-1 text-purple-500" />}
                                      {horse.isFavorite && <Star className="w-4 h-4 inline ml-1 text-amber-500 fill-amber-500" />}
                                      {horse.hasNoCompetitor && <Crown className="w-4 h-4 inline ml-1 text-amber-600" />}
                                    </td>
                                    <td className="p-2">{horse.draw}</td>
                                    <td className="p-2 text-sm">{horse.jockey}</td>
                                    <td className="p-2">{horse.rating}</td>
                                    <td className="p-2">
                                      <div className="flex items-center gap-2">
                                        <Progress value={horse.powerScore} className="w-12 h-2" />
                                        <span className="font-bold text-red-700">{horse.powerScore.toFixed(1)}</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-green-600 font-semibold">{horse.winProbability.toFixed(1)}%</td>
                                    <td className="p-2">
                                      <Badge className={cn(
                                        "text-xs",
                                        horse.valueRating === 'Excellent' && "bg-green-600",
                                        horse.valueRating === 'Good' && "bg-blue-600",
                                        horse.valueRating === 'Fair' && "bg-yellow-600",
                                        horse.valueRating === 'Poor' && "bg-gray-400"
                                      )}>{horse.valueRating}</Badge>
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
                                    <span className="font-bold text-red-800">#{horse.number}</span>
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
                                          {horse.strengths.map((s, k) => <li key={k}>{s}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                    {horse.concerns.length > 0 && (
                                      <div>
                                        <p className="text-sm font-semibold text-red-700 mb-1">{text.concerns}:</p>
                                        <ul className="text-sm text-gray-600 list-disc list-inside">
                                          {horse.concerns.map((c, k) => <li key={k}>{c}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div><strong>{text.trainer}:</strong> {horse.trainer}</div>
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
                    <div className="text-sm text-gray-600">
                      <strong>{text.sources}:</strong> {result.sources.join(' | ')}
                    </div>
                  </CardContent>
                </Card>

                {/* Feedback */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Send className="w-4 h-4" />{text.feedbackTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {feedbackSubmitted ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />{text.thanksFeedback}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                          placeholder={text.feedbackPlaceholder} rows={3} />
                        <Button onClick={handleFeedbackSubmit} disabled={!feedback.trim()}>
                          <Send className="w-4 h-4 mr-2" />{text.sendFeedback}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Features */}
            {!result && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                {[
                  { icon: '📊', title: text.features.f1 },
                  { icon: '🌐', title: text.features.f2 },
                  { icon: '📄', title: text.features.f3 },
                  { icon: '🔤', title: text.features.f4 },
                  { icon: '📧', title: text.features.f5 },
                  { icon: '📺', title: text.features.f6 }
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
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="mt-4">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-red-900 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {isArabic ? 'تقويم السباقات' : 'Racing Calendar'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); setActiveTab('predictions'); }}
                    className="rounded-md border" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Tab */}
          <TabsContent value="live" className="mt-4">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-red-900 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  {isArabic ? 'البث المباشر للسباقات' : 'Live Race Streaming'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Play className="w-16 h-16 text-red-700 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {isArabic ? 'اختر مضماراً من الترشيحات لمشاهدة البث المباشر' : 'Select a racecourse to watch live stream'}
                  </p>
                  <Button onClick={() => window.open('https://www.emiratesracing.com/live-streams', '_blank')}
                    className="bg-red-700 hover:bg-red-600">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {isArabic ? 'فتح صفحة البث المباشر' : 'Open Live Stream Page'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                  {[
                    { name: 'Meydan', url: 'https://www.emiratesracing.com/live-streams/dubai-racing-1' },
                    { name: 'Jebel Ali', url: 'https://www.emiratesracing.com/live-streams/dubai-racing-2' },
                    { name: 'Abu Dhabi', url: 'https://www.emiratesracing.com/live-streams/abu-dhabi-racing' },
                    { name: 'Sharjah', url: 'https://www.emiratesracing.com/live-streams/sharjah-racing' },
                    { name: 'Al Ain', url: 'https://www.emiratesracing.com/live-streams/al-ain-racing' },
                  ].map((track) => (
                    <Button key={track.name} variant="outline" onClick={() => window.open(track.url, '_blank')}
                      className="border-amber-300 text-red-700 hover:bg-amber-50">{track.name}</Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-red-900 text-white py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-amber-200">{text.copyright}</p>
          <p className="text-xs text-red-300 mt-2">
            ⚠️ {isArabic ? 'هذه الترشيحات للترفيه فقط. المراهنة تنطوي على مخاطر.' : 'Predictions are for entertainment only. Betting involves risks.'}
          </p>
        </div>
      </footer>
    </div>
  )
}
