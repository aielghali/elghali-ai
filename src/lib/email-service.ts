import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface EmailConfig {
  server: string;
  port: number;
  username: string;
  password: string;
  fromName: string;
  fromAddress: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: {
    filename: string;
    path: string;
    contentType?: string;
  }[];
}

export interface EmailResult {
  success: boolean;
  message: string;
  messageId?: string;
  previewUrl?: string;
}

/**
 * Get email configuration from environment
 */
export function getEmailConfig(): EmailConfig {
  return {
    server: process.env.SMTP_SERVER || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    username: process.env.SMTP_USERNAME || '',
    password: process.env.SMTP_PASSWORD || '',
    fromName: process.env.EMAIL_FROM_NAME || 'Elghali Ai',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@elghali.ai'
  };
}

/**
 * Check if email is configured
 */
export function isEmailConfigured(): boolean {
  const config = getEmailConfig();
  return !!(config.username && config.password);
}

/**
 * Send email using Python (more reliable for SMTP)
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const config = getEmailConfig();
  
  // Check if configured
  if (!config.username || !config.password) {
    console.log('📧 Email not configured. SMTP credentials required.');
    console.log('📧 Please set SMTP_USERNAME and SMTP_PASSWORD in environment.');
    
    // Log for development
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'email-log.json');
    const existingLogs = fs.existsSync(logFile) 
      ? JSON.parse(fs.readFileSync(logFile, 'utf-8'))
      : [];
    
    existingLogs.push({
      timestamp: new Date().toISOString(),
      to: options.to,
      subject: options.subject,
      status: 'not_configured',
      message: 'SMTP credentials not set'
    });
    
    fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));
    
    return {
      success: false,
      message: 'Email not configured. Please set SMTP_USERNAME and SMTP_PASSWORD environment variables.'
    };
  }
  
  // Create Python script for sending email
  const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
  const attachments = options.attachments || [];
  
  const pythonScript = createPythonEmailScript(config, {
    to: recipients,
    subject: options.subject,
    html: options.html,
    text: options.text || '',
    attachments
  });
  
  const scriptPath = path.join('/tmp', `send_email_${Date.now()}.py`);
  fs.writeFileSync(scriptPath, pythonScript);
  
  try {
    const { stdout, stderr } = await execAsync(`python3 "${scriptPath}"`, {
      timeout: 60000
    });
    
    console.log('📧 Email send output:', stdout);
    if (stderr) console.error('📧 Email send stderr:', stderr);
    
    // Check for success indicators
    if (stdout.includes('Email sent successfully') || stdout.includes('Message sent')) {
      return {
        success: true,
        message: `Email sent successfully to ${recipients}`
      };
    }
    
    // Check if it's a development/test mode success
    if (stdout.includes('Email would be sent') || stdout.includes('simulation')) {
      return {
        success: true,
        message: `Email prepared for ${recipients} (development mode)`
      };
    }
    
    return {
      success: true,
      message: `Email processing completed for ${recipients}`
    };
    
  } catch (error) {
    console.error('📧 Email send error:', error);
    
    return {
      success: false,
      message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  } finally {
    // Cleanup script
    try {
      fs.unlinkSync(scriptPath);
    } catch {}
  }
}

/**
 * Create Python script for sending email
 */
function createPythonEmailScript(
  config: EmailConfig,
  options: {
    to: string;
    subject: string;
    html: string;
    text: string;
    attachments: { filename: string; path: string; contentType?: string }[];
  }
): string {
  const attachmentCode = options.attachments.map(att => `
    # Attach ${att.filename}
    with open('${att.path}', 'rb') as f:
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header(
            'Content-Disposition',
            'attachment',
            filename='${att.filename}'
        )
        msg.attach(part)
`).join('\n');

  return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import sys

def send_email():
    # SMTP Configuration
    smtp_server = '${config.server}'
    smtp_port = ${config.port}
    smtp_username = '${config.username}'
    smtp_password = '${config.password}'
    
    # Create message
    msg = MIMEMultipart('alternative')
    msg['From'] = '${config.fromName} <${config.fromAddress}>'
    msg['To'] = '${options.to}'
    msg['Subject'] = """${options.subject.replace(/"/g, '\\"')}"""
    
    # Plain text version
    text_body = """${options.text.replace(/"/g, '\\"')}"""
    msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
    
    # HTML version
    html_body = '''${options.html.replace(/'/g, "\\'")}'''
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))
    
    # Attachments
    ${attachmentCode}
    
    try:
        # Create secure connection
        context = ssl.create_default_context()
        
        # Connect and send
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
            
        print('Email sent successfully to ${options.to}')
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f'ERROR: SMTP Authentication failed. Check your username and password.')
        print(f'Details: {e}')
        return False
    except smtplib.SMTPException as e:
        print(f'ERROR: SMTP error occurred: {e}')
        return False
    except Exception as e:
        print(f'ERROR: Failed to send email: {e}')
        return False

if __name__ == '__main__':
    success = send_email()
    sys.exit(0 if success else 1)
`;
}

/**
 * Generate HTML email content for race predictions
 */
export function generatePredictionEmailHtml(
  racecourse: string,
  date: string,
  napOfTheDay: { horseName: string; raceName: string; reason: string; confidence?: number },
  totalRaces: number
): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Elghali Ai - تقرير الترشيحات</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #fef3e2 0%, #ffffff 100%);
      margin: 0;
      padding: 20px;
      direction: rtl;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(139, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #8B0000 0%, #A52A2A 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      color: #D4AF37;
    }
    .header p {
      margin: 10px 0 0;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
    }
    .highlight-box {
      background: linear-gradient(135deg, #FFF8DC 0%, #FFFACD 100%);
      border: 2px solid #D4AF37;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .highlight-box h3 {
      color: #8B0000;
      margin: 0 0 10px;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #8B0000;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 10px;
      margin: 20px 0;
      font-size: 12px;
      color: #856404;
    }
    .confidence {
      display: inline-block;
      background: #28a745;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐴 Elghali Ai</h1>
      <p>تقرير ترشيحات سباقات الخيل</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; color: #333;">
        مرحباً،
      </p>
      <p style="color: #666;">
        يرجى إيجاد ملف PDF المرفق الذي يحتوي على ترشيحات سباقات الخيل الكاملة.
      </p>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${racecourse}</div>
          <div class="stat-label">المضمار</div>
        </div>
        <div class="stat">
          <div class="stat-value">${date}</div>
          <div class="stat-label">التاريخ</div>
        </div>
        <div class="stat">
          <div class="stat-value">${totalRaces}</div>
          <div class="stat-label">السباقات</div>
        </div>
      </div>
      
      <div class="highlight-box">
        <h3>🌟 NAP of the Day - ترشيح اليوم</h3>
        <p style="font-size: 24px; font-weight: bold; color: #D4AF37; margin: 10px 0;">
          ${napOfTheDay.horseName}
        </p>
        <p style="color: #666; font-size: 14px;">
          ${napOfTheDay.raceName}
        </p>
        ${napOfTheDay.confidence ? `<p class="confidence">${napOfTheDay.confidence}% ثقة</p>` : ''}
        <p style="color: #333; font-size: 13px; margin-top: 10px;">
          ${napOfTheDay.reason}
        </p>
      </div>
      
      <div class="warning">
        ⚠️ تنبيه: هذه الترشيحات مبنية على تحليل الذكاء الاصطناعي للبيانات المتاحة. 
        المراهنة تنطوي على مخاطر - الرجاء المراهنة بمسؤولية.
      </div>
      
      <p style="color: #333; margin-top: 20px; text-align: center;">
        📎 ملف PDF المرفق يحتوي على الترشيحات الكاملة لجميع السباقات
      </p>
      
      <p style="color: #333; margin-top: 20px;">
        مع أطيب التحيات،<br>
        <strong>فريق Elghali Ai</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>© 2025 Elghali Ai - جميع الحقوق محفوظة</p>
      <p>هذا البريد الإلكتروني تم إرساله تلقائياً - لا ترد عليه</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text email content
 */
export function generatePredictionEmailText(
  racecourse: string,
  date: string,
  napOfTheDay: { horseName: string; raceName: string; reason: string; confidence?: number },
  totalRaces: number
): string {
  return `
Elghali Ai - تقرير ترشيحات سباقات الخيل
=====================================

المضمار: ${racecourse}
التاريخ: ${date}
عدد السباقات: ${totalRaces}

🌟 NAP of the Day - ترشيح اليوم: ${napOfTheDay.horseName}
${napOfTheDay.confidence ? `مستوى الثقة: ${napOfTheDay.confidence}%` : ''}
السباق: ${napOfTheDay.raceName}
السبب: ${napOfTheDay.reason}

---
يرجى إيجاد ملف PDF المرفق الذي يحتوي على الترشيحات الكاملة.

تنبيه: هذه الترشيحات مبنية على تحليل الذكاء الاصطناعي للبيانات المتاحة.
المراهنة تنطوي على مخاطر - الرجاء المراهنة بمسؤولية.

© 2025 Elghali Ai
  `;
}

/**
 * Send race prediction email with PDF attachment
 */
export async function sendPredictionEmail(
  email: string,
  racecourse: string,
  date: string,
  pdfPath: string,
  napOfTheDay: { horseName: string; raceName: string; reason: string; confidence?: number },
  totalRaces: number
): Promise<EmailResult> {
  // Check if PDF exists
  if (!fs.existsSync(pdfPath)) {
    return {
      success: false,
      message: `PDF file not found: ${pdfPath}`
    };
  }
  
  const html = generatePredictionEmailHtml(racecourse, date, napOfTheDay, totalRaces);
  const text = generatePredictionEmailText(racecourse, date, napOfTheDay, totalRaces);
  
  const filename = `Elghali_Ai_${racecourse.replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}_Predictions.pdf`;
  
  return sendEmail({
    to: email,
    subject: `🏇 Elghali Ai - ترشيحات ${racecourse} - ${date}`,
    html,
    text,
    attachments: [{
      filename,
      path: pdfPath,
      contentType: 'application/pdf'
    }]
  });
}

/**
 * Send test email to verify configuration
 */
export async function sendTestEmail(to: string): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: '✅ Elghali Ai - Test Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B0000;">✅ Email Configuration Successful</h1>
        <p>Congratulations! Your email configuration is working correctly.</p>
        <p>You will now receive automatic race prediction reports.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Elghali Ai - Horse Racing Predictions</p>
      </div>
    `,
    text: 'Email Configuration Successful! You will receive automatic race prediction reports.'
  });
}
