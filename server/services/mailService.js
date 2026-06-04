import nodemailer from 'nodemailer'

// Transactional mail for Scam Squad authentication.
// Provider: Nodemailer over Gmail SMTP.
//
// Required environment variables:
// - Preferred: SMTP_USER, SMTP_PASS, optional SMTP_FROM
// - Backward-compatible aliases: GMAIL_USER, GMAIL_APP_PASSWORD
//
// Development fallback:
// - If no SMTP credentials are configured and NODE_ENV !== 'production',
//   the PIN is logged to the server console so local auth can be tested.
// - PINs are never logged in production.

let transporter = null

function isProduction() {
  return process.env.NODE_ENV === 'production'
}

function getSmtpConfig() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD
  const from = process.env.SMTP_FROM || user
  return { user, pass, from }
}

function getTransporter() {
  if (transporter) return transporter

  const { user, pass } = getSmtpConfig()
  if (!user || !pass) return null

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
  })
  return transporter
}

function mailError(message) {
  const error = new Error(message)
  error.status = 503
  return error
}

function safeSmtpError(error) {
  return {
    code: error?.code,
    command: error?.command,
    responseCode: error?.responseCode,
    message: error?.message,
  }
}

export async function sendOtpEmail(to, code) {
  const tx = getTransporter()

  if (!tx) {
    if (!isProduction()) {
      console.warn(
        `[mailService] SMTP not configured. Development PIN for ${to}: ${code}`,
      )
      return
    }
    throw mailError(
      'Verification email could not be sent because SMTP is not configured.',
    )
  }

  try {
    const { from } = getSmtpConfig()
    await tx.sendMail({
      from,
      to,
      subject: 'Your Scam Squad verification PIN',
      text: `Agent, your secure access PIN is ${code}. It expires in 10 minutes.`,
      html: `<p>Agent, your secure access PIN is <strong style="font-size:20px">${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
    })
  } catch (error) {
    console.error(
      '[mailService] Failed to send verification email:',
      safeSmtpError(error),
    )
    throw mailError(
      'Verification email could not be sent. Check mail configuration and try again.',
    )
  }
}
