const nodemailer = require("nodemailer")

const sendEmail = async options => {
    // 1 Create a transporter

    const transporter = nodemailer.createTransport({
        // service: "Gmail",
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        //-----Activate in Gmail "less secure app" option--ONLY IF WE USE GMAIL--
    })

    // 2) Define the email options
    const html= `<a href='http://localhost:3000/resetPassword/${options.resetToken}' target="_blank">RESET PASSWORD</a>`
    const mailOptions = {
        from: "House Of Auctions <support@hoa.com>",
        to: options.email,
        subject: options.subject,
        text: options.message,
        html
    }

    // 3) Actually send the email

    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail