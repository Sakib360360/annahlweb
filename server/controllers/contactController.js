import nodemailer from 'nodemailer'

const TEST_RECEIVER = 'saakibabrar@gmail.com'

function getMailConfig() {
  const user = process.env.MAIL_USER || ''
  const pass = process.env.MAIL_PASS || ''
  const to = process.env.CONTACT_RECEIVER || TEST_RECEIVER
  return { user, pass, to }
}

export async function sendContactMessage(req, res) {
  const { name, email, message } = req.body || {}

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' })
  }

  const { user, pass, to } = getMailConfig()
  if (!user || !pass) {
    return res.status(500).json({ message: 'Email service is not configured yet.' })
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })

    await transporter.sendMail({
      from: `An-Nahl Contact <${user}>`,
      to,
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>New Contact Form Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${String(message).replace(/\n/g, '<br/>')}</p>
        </div>
      `,
    })

    return res.json({ message: 'Message sent successfully.' })
  } catch (error) {
    console.error('sendContactMessage error', error)
    return res.status(500).json({ message: 'Failed to send message. Please try again.' })
  }
}
