/**
 * Elghali AI - Professional PDF Report Generator
 * Generates horse racing prediction reports with Arabic support
 */

import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// ==================== TYPES ====================

export interface HorsePrediction {
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
}

export interface RacePredictionData {
  raceNumber: number
  raceName: string
  raceTime: string
  distance: number
  surface: string
  going: string
  predictions: HorsePrediction[]
  raceAnalysis: string
}

export interface ReportData {
  racecourse: string
  country: string
  date: string
  totalRaces: number
  races: RacePredictionData[]
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
  generatedAt: string
}

// ==================== PDF GENERATOR CLASS ====================

export class PDFGenerator {
  private downloadDir: string

  constructor() {
    this.downloadDir = path.join(process.cwd(), 'download')
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true })
    }
  }

  /**
   * Generate a professional PDF report
   */
  async generateReport(data: ReportData): Promise<{ success: boolean; pdfPath: string; message: string }> {
    try {
      // Generate HTML content
      const htmlContent = this.generateHTMLReport(data)
      
      // Save HTML file
      const htmlFileName = `Elghali_Ai_${data.racecourse.replace(/\s+/g, '_')}_${data.date}_Report.html`
      const htmlFilePath = path.join(this.downloadDir, htmlFileName)
      fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8')
      
      // Try to convert to PDF using wkhtmltopdf or similar
      const pdfFileName = `Elghali_Ai_${data.racecourse.replace(/\s+/g, '_')}_${data.date}_Report.pdf`
      const pdfFilePath = path.join(this.downloadDir, pdfFileName)
      
      try {
        // Try wkhtmltopdf
        await execAsync(`wkhtmltopdf --encoding utf-8 --page-size A4 "${htmlFilePath}" "${pdfFilePath}"`, {
          timeout: 30000
        })
        
        if (fs.existsSync(pdfFilePath)) {
          return {
            success: true,
            pdfPath: pdfFilePath,
            message: 'PDF report generated successfully'
          }
        }
      } catch {
        console.log('wkhtmltopdf not available, using HTML as fallback')
      }
      
      // Return HTML path if PDF conversion failed
      return {
        success: true,
        pdfPath: htmlFilePath,
        message: 'Report generated as HTML (PDF converter not available)'
      }
      
    } catch (error) {
      console.error('[PDFGenerator] Error:', error)
      return {
        success: false,
        pdfPath: '',
        message: `Error generating report: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Generate HTML report with Arabic support
   */
  private generateHTMLReport(data: ReportData): string {
    const isArabic = true // Default to Arabic for UAE reports
    
    return `<!DOCTYPE html>
<html lang="${isArabic ? 'ar' : 'en'}" dir="${isArabic ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Elghali AI - ${data.racecourse} ${data.date}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
      background: linear-gradient(135deg, #fef3e2 0%, #ffffff 100%);
      color: #333;
      line-height: 1.6;
      direction: ${isArabic ? 'rtl' : 'ltr'};
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #8B0000 0%, #A52A2A 100%);
      color: white;
      padding: 25px;
      text-align: center;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    
    .logo {
      font-size: 36px;
      margin-bottom: 10px;
    }
    
    .header h1 {
      color: #D4AF37;
      font-size: 28px;
      margin-bottom: 5px;
    }
    
    .header .subtitle {
      color: #f0e6d3;
      font-size: 14px;
    }
    
    .meta-info {
      display: flex;
      justify-content: space-around;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #e0e0e0;
    }
    
    .meta-item {
      text-align: center;
    }
    
    .meta-value {
      font-size: 18px;
      font-weight: bold;
      color: #8B0000;
    }
    
    .meta-label {
      font-size: 12px;
      color: #666;
    }
    
    .nap-section {
      background: linear-gradient(135deg, #FFF8DC 0%, #FFFACD 100%);
      border: 2px solid #D4AF37;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .nap-title {
      font-size: 14px;
      color: #8B0000;
      margin-bottom: 10px;
    }
    
    .nap-horse {
      font-size: 28px;
      font-weight: bold;
      color: #D4AF37;
      margin-bottom: 5px;
    }
    
    .nap-race {
      font-size: 12px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .nap-reason {
      font-size: 13px;
      color: #333;
    }
    
    .confidence-badge {
      display: inline-block;
      background: #28a745;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin-top: 8px;
    }
    
    .race-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 15px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    
    .race-header {
      background: linear-gradient(135deg, #8B0000 0%, #A52A2A 100%);
      color: white;
      padding: 12px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .race-name {
      font-weight: bold;
      font-size: 14px;
    }
    
    .race-info {
      font-size: 11px;
      color: #f0e6d3;
    }
    
    .predictions-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .predictions-table th {
      background: #f8f9fa;
      padding: 8px 10px;
      text-align: ${isArabic ? 'right' : 'left'};
      font-size: 11px;
      font-weight: 600;
      color: #8B0000;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .predictions-table td {
      padding: 8px 10px;
      font-size: 11px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .predictions-table tr:nth-child(1) {
      background: #fff8dc;
    }
    
    .predictions-table tr:nth-child(2) {
      background: #f5f5f5;
    }
    
    .predictions-table tr:nth-child(3) {
      background: #fff5eb;
    }
    
    .position-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-weight: bold;
      font-size: 12px;
    }
    
    .position-1 {
      background: #D4AF37;
      color: white;
    }
    
    .position-2 {
      background: #C0C0C0;
      color: white;
    }
    
    .position-3 {
      background: #CD7F32;
      color: white;
    }
    
    .power-score {
      font-weight: bold;
      color: #8B0000;
    }
    
    .win-prob {
      color: #28a745;
      font-weight: 600;
    }
    
    .value-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: bold;
    }
    
    .value-excellent {
      background: #28a745;
      color: white;
    }
    
    .value-good {
      background: #17a2b8;
      color: white;
    }
    
    .value-fair {
      background: #ffc107;
      color: #333;
    }
    
    .race-analysis {
      padding: 10px 15px;
      background: #f8f9fa;
      font-size: 11px;
      color: #555;
      border-top: 1px solid #e0e0e0;
    }
    
    .picks-section {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .pick-card {
      flex: 1;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    
    .pick-card h4 {
      font-size: 12px;
      color: #8B0000;
      margin-bottom: 8px;
    }
    
    .pick-card .horse-name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    
    .pick-card .horse-race {
      font-size: 10px;
      color: #666;
    }
    
    .footer {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
    }
    
    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 10px;
      font-size: 10px;
      color: #856404;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .sources {
      font-size: 9px;
      color: #999;
      margin-top: 10px;
    }
    
    .copyright {
      font-size: 10px;
      color: #666;
      margin-top: 10px;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    @media print {
      body {
        background: white;
      }
      
      .page {
        box-shadow: none;
        margin: 0;
        width: 100%;
      }
      
      .race-card {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="logo">🏇</div>
      <h1>Elghali AI</h1>
      <div class="subtitle">${isArabic ? 'ترشيحات سباقات الخيل الذكية' : 'Smart Horse Racing Predictions'}</div>
    </div>
    
    <!-- Meta Info -->
    <div class="meta-info">
      <div class="meta-item">
        <div class="meta-value">${data.racecourse}</div>
        <div class="meta-label">${isArabic ? 'المضمار' : 'Racecourse'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-value">${data.date}</div>
        <div class="meta-label">${isArabic ? 'التاريخ' : 'Date'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-value">${data.totalRaces}</div>
        <div class="meta-label">${isArabic ? 'السباقات' : 'Races'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-value">${data.country}</div>
        <div class="meta-label">${isArabic ? 'الدولة' : 'Country'}</div>
      </div>
    </div>
    
    <!-- NAP Section -->
    <div class="nap-section">
      <div class="nap-title">🌟 ${isArabic ? 'ترشيح اليوم - NAP of the Day' : 'NAP of the Day'}</div>
      <div class="nap-horse">${data.napOfTheDay.horseName}</div>
      <div class="nap-race">${data.napOfTheDay.raceName}</div>
      <span class="confidence-badge">${data.napOfTheDay.confidence}% ${isArabic ? 'ثقة' : 'Confidence'}</span>
      <div class="nap-reason">${data.napOfTheDay.reason}</div>
    </div>
    
    <!-- Picks Section -->
    <div class="picks-section">
      <div class="pick-card">
        <h4>🥈 ${isArabic ? 'الترشيح الثاني' : 'Next Best'}</h4>
        <div class="horse-name">${data.nextBest.horseName}</div>
        <div class="horse-race">${data.nextBest.raceName}</div>
      </div>
      <div class="pick-card">
        <h4>💰 ${isArabic ? 'ترشيح القيمة' : 'Value Pick'}</h4>
        <div class="horse-name">${data.valuePick.horseName}</div>
        <div class="horse-race">${data.valuePick.raceName}</div>
      </div>
    </div>
    
    <!-- Warning -->
    <div class="warning">
      ⚠️ ${isArabic 
        ? 'تنبيه: هذه الترشيحات مبنية على تحليل الذكاء الاصطناعي. المراهنة تنطوي على مخاطر - الرجاء المراهنة بمسؤولية.' 
        : 'Warning: These predictions are based on AI analysis. Betting involves risks - please bet responsibly.'}
    </div>
    
    <!-- Race Cards -->
    ${data.races.map((race, index) => `
      <div class="race-card">
        <div class="race-header">
          <div class="race-name">
            ${isArabic ? `السباق ${race.raceNumber}` : `Race ${race.raceNumber}`} - ${race.raceName}
          </div>
          <div class="race-info">
            ${race.raceTime} | ${race.distance}m | ${race.surface} | ${race.going}
          </div>
        </div>
        <table class="predictions-table">
          <thead>
            <tr>
              <th>${isArabic ? 'المركز' : 'Pos'}</th>
              <th>${isArabic ? 'الحصان' : 'Horse'}</th>
              <th>${isArabic ? 'البوابة' : 'Draw'}</th>
              <th>${isArabic ? 'الفارس' : 'Jockey'}</th>
              <th>${isArabic ? 'المدرب' : 'Trainer'}</th>
              <th>${isArabic ? 'التقييم' : 'Rating'}</th>
              <th>${isArabic ? 'Power Score' : 'Power'}</th>
              <th>${isArabic ? 'الاحتمال' : 'Win %'}</th>
              <th>${isArabic ? 'القيمة' : 'Value'}</th>
            </tr>
          </thead>
          <tbody>
            ${race.predictions.slice(0, 5).map((horse, hIndex) => `
              <tr>
                <td>
                  <span class="position-badge position-${hIndex + 1}">${hIndex + 1}</span>
                </td>
                <td><strong>${horse.name}</strong></td>
                <td>${horse.draw}</td>
                <td>${horse.jockey}</td>
                <td>${horse.trainer}</td>
                <td>${horse.rating}</td>
                <td class="power-score">${horse.powerScore.toFixed(1)}</td>
                <td class="win-prob">${horse.winProbability.toFixed(1)}%</td>
                <td>
                  <span class="value-badge value-${horse.valueRating.toLowerCase()}">${horse.valueRating}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${race.raceAnalysis ? `
          <div class="race-analysis">
            <strong>${isArabic ? 'تحليل السباق:' : 'Race Analysis:'}</strong> ${race.raceAnalysis}
          </div>
        ` : ''}
      </div>
      ${index > 0 && index % 4 === 0 ? '<div class="page-break"></div>' : ''}
    `).join('')}
    
    <!-- Footer -->
    <div class="footer">
      <div class="sources">
        ${isArabic ? 'المصادر:' : 'Sources:'} ${data.sources.join(' | ')}
      </div>
      <div class="copyright">
        © ${new Date().getFullYear()} Elghali AI - ${isArabic ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}
      </div>
      <div style="font-size: 9px; color: #999; margin-top: 5px;">
        ${isArabic ? 'تم إنشاء التقرير:' : 'Generated:'} ${data.generatedAt}
      </div>
    </div>
  </div>
</body>
</html>`
  }

  /**
   * Generate a quick summary report
   */
  async generateQuickSummary(data: ReportData): Promise<string> {
    const summary = `
═══════════════════════════════════════════════════════════════
                    ELGHALI AI - RACE PREDICTIONS
═══════════════════════════════════════════════════════════════

📍 Racecourse: ${data.racecourse}
📅 Date: ${data.date}
🏁 Total Races: ${data.totalRaces}

═══════════════════════════════════════════════════════════════
                    🌟 NAP OF THE DAY
═══════════════════════════════════════════════════════════════
Horse: ${data.napOfTheDay.horseName}
Race: ${data.napOfTheDay.raceName}
Confidence: ${data.napOfTheDay.confidence}%
Reason: ${data.napOfTheDay.reason}

═══════════════════════════════════════════════════════════════
                    RACE PREDICTIONS
═══════════════════════════════════════════════════════════════

${data.races.map(race => `
RACE ${race.raceNumber} - ${race.raceName}
Time: ${race.raceTime} | Distance: ${race.distance}m | Surface: ${race.surface}
${'─'.repeat(60)}
${race.predictions.slice(0, 3).map((h, i) => 
  `${i + 1}. ${h.name} (Draw ${h.draw}) - Power: ${h.powerScore.toFixed(1)} | Win: ${h.winProbability.toFixed(1)}%`
).join('\n')}
`).join('\n')}

═══════════════════════════════════════════════════════════════
⚠️ WARNING: These predictions are based on AI analysis.
Betting involves risks - please bet responsibly.
═══════════════════════════════════════════════════════════════
Generated by Elghali AI at ${data.generatedAt}
═══════════════════════════════════════════════════════════════
`
    return summary
  }

  /**
   * Get download path for a file
   */
  getDownloadPath(filename: string): string {
    return path.join(this.downloadDir, filename)
  }

  /**
   * Check if a file exists
   */
  fileExists(filepath: string): boolean {
    return fs.existsSync(filepath)
  }

  /**
   * Delete a file
   */
  deleteFile(filepath: string): void {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }
  }
}

// Export singleton instance
export const pdfGenerator = new PDFGenerator()
