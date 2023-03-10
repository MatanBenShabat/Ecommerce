const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.username.split(" ")[0];
    this.url = url;
    this.from = `houseofauctionss@gmail.com`;
  }
  newTransport() {
    // if (process.env.NODE_ENV === "production") {
    //Sendgrid
    return nodemailer.createTransport({
      service: "Sendgrid",
      host: process.env.SENDGRID_HOST,
      port: process.env.SENDGRID_PORT,
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
  }

  //   return nodemailer.createTransport({
  //     host: process.env.EMAIL_HOST,
  //     port: process.env.EMAIL_PORT,
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD,
  //     },
  //   });
  // }
  //Send the actual email
  async send(template, subject) {
    //1) Render the HTML based on a pug template

    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    //2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };
    //3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("welcome", "Welcome to HOA family!");
  }

  async sendPasswordReset() {
    this.send("resetPassword", "Your password reset token (valid for 10 min)");
  }
};

// const sendEmail = async (options) => {
//   // 1 Create a transporter
//   // const transporter = nodemailer.createTransport({
//   //     // service: "Gmail",
//   //     host: process.env.EMAIL_HOST,
//   //     port: process.env.EMAIL_PORT,
//   //     auth: {
//   //         user: process.env.EMAIL_USERNAME,
//   //         pass: process.env.EMAIL_PASSWORD
//   //     }
//   //     //-----Activate in Gmail "less secure app" option--ONLY IF WE USE GMAIL--
//   // })
//   // 2) Define the email options
//   //   const html = `<a href='https://house-of-auctions.netlify.app/resetPassword/${options.resetToken}' target="_blank">RESET PASSWORD</a>`;
//   // const mailOptions = {
//   //     from: `House Of Auctions <${process.env.EMAIL_FROM}>`,
//   //     to: options.email,
//   //     subject: options.subject,
//   //     text: options.message,
//   //     html
//   // }
//   // 3) Actually send the email
//   //   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail
