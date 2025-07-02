// utils/mailer.js
import nodemailer from 'nodemailer';

import dotenv from 'dotenv'

dotenv.config(); // Load .env variables
export const sendVerificationEmail = async (toEmail, link) => {
  // Configurations of my email service
    const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_USE_SSL,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
    });


  const mailOptions = {
    from: `"Smartmart" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Please verify your email',
    html: `
      <p>Welcome! Please click the link below to verify your email:</p>
      <a href="${link}">${link}</a>
      <p>This link will expire in 15 minutes.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
