const nodemailer = require('nodemailer')
const { loadEnv } = require('../config/env')
const env = loadEnv()

let transport
function getTransport() {
  if (!transport) {
    if (!env.SMTP_HOST) return null
    transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT || '587', 10),
      secure: String(env.SMTP_SECURE || 'false') === 'true',
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
    })
  }
  return transport
}

async function sendMail({ to, subject, text, html }) {
  const t = getTransport()
  if (!t) return false
  const from = env.EMAIL_FROM || 'no-reply@localhost'
  await t.sendMail({ from, to, subject, text, html })
  return true
}

module.exports = { sendMail }
