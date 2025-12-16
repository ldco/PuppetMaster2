/**
 * Email Service
 *
 * Uses Nodemailer with SMTP for sending emails.
 * Configure via environment variables:
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
import nodemailer from 'nodemailer'

// Lazy-initialized transporter
let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter

  const config = useRuntimeConfig()
  const { smtpHost, smtpPort, smtpUser, smtpPass } = config

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('[Email] SMTP not configured - emails will be skipped')
    return null
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort) || 465,
    secure: Number(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  })

  return transporter
}

interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

/**
 * Send an email
 * Returns true if sent, false if skipped (not configured)
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const transport = getTransporter()
  if (!transport) return false

  const config = useRuntimeConfig()
  const from = config.smtpFrom || config.smtpUser

  try {
    await transport.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    })
    console.log(`[Email] Sent to ${options.to}: ${options.subject}`)
    return true
  } catch (error) {
    console.error('[Email] Failed to send:', error)
    return false
  }
}

/**
 * Send contact form confirmation to user
 */
export async function sendContactConfirmation(
  to: string,
  name: string,
  siteName: string = 'Our Team'
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `We received your message - ${siteName}`,
    text: `Hi ${name},\n\nThank you for contacting us! We have received your message and will get back to you as soon as possible.\n\nBest regards,\n${siteName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for reaching out!</h2>
        <p>Hi ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Best regards,<br/><strong>${siteName}</strong></p>
      </div>
    `
  })
}

