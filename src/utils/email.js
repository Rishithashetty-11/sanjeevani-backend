const nodemailer = require('nodemailer');

// Mock email utility as requested for now.
// Real SMTP code is provided below but commented out.

const sendEmail = async (to, subject, text) => {
  // --- MOCK IMPLEMENTATION ---
  console.log(`\n================= EMAIL MOCK =================`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${text}`);
  console.log(`==============================================\n`);
  return true;

  // --- ACTUAL SMTP IMPLEMENTATION ---
  /*
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // e.g., your gmail address
        pass: process.env.SMTP_PASS, // e.g., an app password
      },
    });

    const info = await transporter.sendMail({
      from: `"Sanjeevani App" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      text: text,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
  */
};

module.exports = { sendEmail };
