const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your email (e.g., test@gmail.com)
    pass: process.env.EMAIL_PASS, // app-specific password
  },
});

const sendMail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to", to);
  } catch (err) {
    console.error("❌ Failed to send email to", to, err);
  }
};

module.exports = sendMail;