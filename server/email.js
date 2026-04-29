const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

async function sendEmail({ to, cc, subject, body }) {
  if (!transporter) {
    console.log(`[EMAIL STUB] To: ${to} | CC: ${cc}\nSubject: ${subject}\n${body}`);
    return { mocked: true };
  }

  const info = await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    cc,
    subject,
    text: body,
  });

  return { messageId: info.messageId };
}

module.exports = { sendEmail };
