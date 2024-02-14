const nodemailer = require("nodemailer");
// const { google } = require("googleapis");
const { MAIL_CONFIG } = require("../configs/constant");
// const OAuth2 = google.auth.OAuth2;


/**
 * 
 * @param option 
 * @returns 
 */
async function smtpSender(option) {
   try {
      const { to, subject, html } = option;

      if (!to) {
         throw new Error("Required receiver email address!");
      }

      const transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            user: MAIL_CONFIG.email,
            pass: MAIL_CONFIG.password
         }
      });

      const info = await transporter.sendMail({
         from: MAIL_CONFIG.email,
         to,
         subject,
         html
      });

      return info;

   } catch (error) {
      throw new Error(error?.message);
   }
}

module.exports = { smtpSender };