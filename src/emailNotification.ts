import { LogMessage } from './logger';
import nodemailer from 'nodemailer';

export const emailNotification = (logMessage: LogMessage) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password'
    }
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'recipient-email@gmail.com',
    subject: `Log: ${logMessage.level}`,
    text: JSON.stringify(logMessage, null, 2)
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};
