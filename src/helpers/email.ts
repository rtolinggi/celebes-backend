import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import { EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD } from "../configs/constant";

const createTransporter = (email: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  const mailOptions: SendMailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: subject,
    html: html,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(info.accepted, info.rejected, info.pending);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });
};

export const bodyEmail = (link: string): string => {
  return `
    <h1>Verified Email</h1>
    <p><b> Click link Bottom </b></p>
    <a href="${link}">Activate</a>
    `;
};

export default createTransporter;
