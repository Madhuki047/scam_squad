// Transactional mail for Scam Squad authentication.
// Provider: Resend API.
//
// Required Railway variable:
// - RESEND_API_KEY
//
// Optional sender variables:
// - EMAIL_FROM
// - RESEND_FROM
//
// Development fallback:
// - If RESEND_API_KEY is missing and NODE_ENV !== 'production',
//   the PIN is logged to the server console so local auth can be tested.
// - PINs are never logged in production.

const RESEND_EMAIL_URL = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'Scam Squad <onboarding@resend.dev>'

function isProduction() {
  return process.env.NODE_ENV === 'production'
}

function getMailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || process.env.RESEND_FROM || DEFAULT_FROM,
  }
}

function mailError(message) {
  const error = new Error(message)
  error.status = 503
  return error
}

function safeResendError(status, body) {
  return {
    status,
    message: body?.message,
    name: body?.name,
  }
}

async function readJsonSafely(response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

export async function sendOtpEmail(to, code) {
  const { apiKey, from } = getMailConfig()

  if (!apiKey) {
    if (!isProduction()) {
      console.warn(
        `[mailService] RESEND_API_KEY not configured. Development PIN for ${to}: ${code}`,
      )
      return
    }
    throw mailError(
      'Verification email could not be sent because RESEND_API_KEY is not configured.',
    )
  }

  const payload = {
    from,
    to,
    subject: 'Your Scam Squad verification PIN',
    text: `Agent, your secure access PIN is ${code}. It expires in 10 minutes.`,
    html: `<p>Agent, your secure access PIN is <strong style="font-size:20px">${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
  }

  let response
  try {
    response = await fetch(RESEND_EMAIL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error('[mailService] Resend request failed:', {
      name: error?.name,
      message: error?.message,
      causeCode: error?.cause?.code,
    })
    throw mailError(
      'Verification email could not be sent. Resend API request failed.',
    )
  }

  if (!response.ok) {
    const body = await readJsonSafely(response)
    console.error(
      '[mailService] Resend rejected verification email:',
      safeResendError(response.status, body),
    )
    throw mailError(
      body?.message ||
        'Verification email could not be sent. Check Resend configuration and try again.',
    )
  }
}
