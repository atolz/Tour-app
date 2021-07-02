const path = require('path');
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Elisha Atolagbe ${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Send grid
      return 1;
    }

    // Mail trap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendMail(template, subject) {
    const html = pug.renderFile(
      path.join(__dirname, '../views/emails/', `${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    const mailOpt = {
      to: this.to,
      from: this.from,
      subject,
      html,
      text: htmlToText.htmlToText(html),
    };
    await this.newTransport().sendMail(mailOpt);
  }

  async sendWelcome() {
    await this.sendMail('welcome', 'Welcome to natours.io...');
  }

  async sendResetPassword() {
    await this.sendMail(
      'passwordReset',
      'Password reset token (valid for 10minutes)'
    );
  }
};

// module.exports = async (options) => {
//   // 1) create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   // 2) specify email options
//   const emailOptions = {
//     from: 'atolagbeelisha001@gmail.com',
//     subject: options.subject,
//     to: options.email,
//     text: options.text,
//   };

//   // 3) actually send email
//   await transporter.sendMail(emailOptions);
// };
