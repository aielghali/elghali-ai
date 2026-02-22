import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, racecourse, date, napOfTheDay, totalRaces } = body

    if (!to) {
      return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })

    const horseName = napOfTheDay?.horseName || 'Top Pick'
    
    await transporter.sendMail({
      from: `"Elghali Ai" <${process.env.SMTP_USER}>`,
      to,
      subject: `🏇 Elghali Ai - ${racecourse} ${date}`,
      html: `
        <div dir="rtl" style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B0000;">🏇 Elghali Ai</h1>
          <h2>${racecourse} - ${date}</h2>
          <p>إجمالي السباقات: ${totalRaces || 0}</p>
          <div style="background: #FFD700; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>🌟 NAP of the Day: ${horseName}</h3>
            <p>${napOfTheDay?.reason || 'أفضل ترشيح اليوم'}</p>
          </div>
          <p style="color: #666;">Elghali Ai - نظام الترشيحات الذكية</p>
        </div>
      `
    })

    return NextResponse.json({ success: true, message: 'Email sent' })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ success: false, message: 'Email failed' }, { status: 500 })
  }
}
