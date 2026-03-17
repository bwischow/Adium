import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'Adium <alerts@adium.io>'

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: params.to,
    subject: params.subject,
    html: params.html,
  })

  if (error) {
    console.error('[email] Resend error:', error)
    throw new Error(`Failed to send email: ${error.message}`)
  }
}
