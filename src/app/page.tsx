'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Trophy, CheckCircle2, AlertCircle, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function Home() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [racecourse, setRacecourse] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const isArabic = lang === 'ar'
  const dir = isArabic ? 'rtl' : 'ltr'

  const text = {
    title: isArabic ? 'Elghali Ai' : 'Elghali Ai',
    subtitle: isArabic ? 'ترشيحات سباقات الخيل الذكية' : 'Smart Horse Racing Predictions',
    welcome: isArabic ? 'مرحباً بك في Elghali Ai' : 'Welcome to Elghali Ai',
    desc: isArabic ? 'نظام الذكاء الاصطناعي لتحليل سباقات الخيل' : 'AI system for horse racing analysis',
    dateLabel: isArabic ? 'تاريخ السباق' : 'Race Date',
    raceLabel: isArabic ? 'اسم المضمار' : 'Racecourse',
    emailLabel: isArabic ? 'البريد الإلكتروني' : 'Email',
    start: isArabic ? 'بدء التحليل' : 'Start Analysis',
    processing: isArabic ? 'جاري المعالجة...' : 'Processing...',
    success: isArabic ? 'تم بنجاح!' : 'Success!',
    errorTitle: isArabic ? 'خطأ' : 'Error',
    nap: isArabic ? 'ترشيح اليوم' : 'NAP of the Day',
    races: isArabic ? 'سباقات' : 'Races',
    copyright: isArabic ? '© 2025 Elghali Ai - جميع الحقوق محفوظة' : '© 2025 Elghali Ai - All Rights Reserved'
  }

  const handleSubmit = async () => {
    if (!date || !racecourse || !email) {
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
          email: email.trim()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-red-50" dir={dir}>
      {/* Header */}
      <header className="bg-gradient-to-l from-red-900 via-red-800 to-red-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center text-3xl">
                🐎
              </div>
              <div>
                <h1 className="text-3xl font-bold text-amber-400">{text.title}</h1>
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

      {/* Main */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Welcome */}
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

        {/* Form */}
        <Card className="mb-6 shadow-lg border-amber-200">
          <CardHeader className="bg-gradient-to-l from-red-900 to-red-800 text-white rounded-t-lg">
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {isArabic ? 'إدخال بيانات السباق' : 'Race Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* Date */}
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

            {/* Racecourse */}
            <div className="space-y-2">
              <Label className="text-red-900 font-bold">{text.raceLabel}</Label>
              <Input
                value={racecourse}
                onChange={(e) => setRacecourse(e.target.value)}
                placeholder={isArabic ? 'مثال: Meydan, Ascot' : 'e.g., Meydan, Ascot'}
                className="bg-white border-amber-200"
                list="tracks"
              />
              <datalist id="tracks">
                <option value="Meydan" />
                <option value="Jebel Ali" />
                <option value="Abu Dhabi" />
                <option value="Sharjah" />
                <option value="Al Ain" />
                <option value="Ascot" />
                <option value="Newmarket" />
                <option value="York" />
              </datalist>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-red-900 font-bold">{text.emailLabel}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="bg-white border-amber-200"
                dir="ltr"
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-l from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white py-6 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {text.processing}
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  {text.start}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>{text.errorTitle}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <Card className="mb-6 shadow-lg border-amber-200">
            <CardHeader className="bg-gradient-to-l from-red-900 to-red-800 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-amber-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {text.success}
                </CardTitle>
                <Badge className="bg-amber-400 text-red-900">
                  {result.totalRaces} {text.races}
                </Badge>
              </div>
              <p className="text-amber-200 text-sm mt-1">
                {result.racecourse} - {result.date}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {/* NAP */}
              <div className="mb-6 p-4 bg-gradient-to-l from-amber-50 to-amber-100 rounded-lg border-2 border-amber-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🌟</span>
                  <h3 className="font-bold text-red-900 text-lg">{text.nap}</h3>
                </div>
                <p className="text-2xl font-bold text-amber-700">{result.napOfTheDay?.horseName}</p>
                <p className="text-gray-600 mt-1">{result.napOfTheDay?.reason}</p>
              </div>

              {/* All Races */}
              <div className="space-y-4">
                {result.predictions?.map((race: any, i: number) => (
                  <div key={i} className="border border-amber-200 rounded-lg overflow-hidden">
                    <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex justify-between items-center">
                      <span className="font-bold text-red-900">{race.raceName}</span>
                      <span className="text-sm text-gray-500">{race.raceTime} • {race.surface}</span>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-3 gap-3">
                        {race.predictions?.map((horse: any, j: number) => (
                          <div 
                            key={j} 
                            className={cn(
                              "p-3 rounded-lg text-center",
                              j === 0 && "bg-amber-100 border-2 border-amber-400",
                              j === 1 && "bg-gray-100 border border-gray-300",
                              j === 2 && "bg-orange-50 border border-orange-200"
                            )}
                          >
                            <div className="text-xs font-bold mb-1">
                              {j === 0 ? '🥇' : j === 1 ? '🥈' : '🥉'} {horse.position}
                            </div>
                            <div className="font-bold text-red-900">{horse.horseName}</div>
                            <div className="text-sm text-amber-600 font-medium">{horse.winProbability}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🏆', title: isArabic ? 'تحليل متقدم' : 'Advanced Analysis' },
            { icon: '📅', title: isArabic ? 'تحديثات يومية' : 'Daily Updates' },
            { icon: '📧', title: isArabic ? 'تقارير PDF' : 'PDF Reports' }
          ].map((item, i) => (
            <Card key={i} className="border-amber-200">
              <CardContent className="pt-4">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm font-medium text-red-900">{item.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-red-900 text-white py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-amber-200">{text.copyright}</p>
        </div>
      </footer>
    </div>
  )
}
