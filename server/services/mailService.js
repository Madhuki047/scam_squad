import nodemailer from 'nodemailer'

// Sends transactional email - currently just 2FA one-time codes - over
// Gmail SMTP.
//
// GRACEFUL BY DESIGN: if SMTP credentials are not configured, the 2FA
// flow still works for development. Instead of sending mail, the code is
// printed to the server console, so you can test login + verify-otp
// without setting up a Gmail App Password.

let transporter = null

// Built lazily on first use so a missing config never crashes startup.
function getTransporter() {
  if (transporter) return transporter

  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!user || !pass) return null

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
  return transporter
}

// Email a 6-digit OTP. Always resolves: a mail failure must not break
// login, and the console fallback keeps the flow testable.
export async function sendOtpEmail(to, code) {
  const tx = getTransporter()

  if (!tx) {
    // Warning, not info: SMTP being unconfigured is a dev-only fallback.
    // Using stderr also guarantees the OTP shows up promptly when stdout
    // is piped or redirected (Node's stderr is blocking by default).
    console.warn(
      `[mailService] SMTP not configured - OTP for ${to} is: ${code}`,
    )
    return
  }

  try {
    await tx.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: 'Your Scam Squad verification code',
      text: `Agent, your one-time code is ${code}. It expires in 5 minutes.`,
      html: `<p>Agent, your one-time code is <strong style="font-size:20px">${code}</strong>.</p><p>It expires in 5 minutes.</p>`,
    })
  } catch (error) {
    console.warn('[mailService] Failed to send OTP email:', error.message)
    console.log(`[mailService] OTP for ${to} is: ${code}`)
  }
}
