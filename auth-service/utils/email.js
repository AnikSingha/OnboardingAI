const nodemailer = require('nodemailer')
const accountManager = require('./accounts.js')
const { createToken } = require('./token.js')
require('dotenv').config()


const transporter = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    auth: {
        user: 'onboardingaicontact@gmail.com',
        pass: process.env.EMAILPASSWORD,
    },
});

async function sendEmailLogin(email) {
    try {
        let userInfo = await accountManager.getUserInfo(email)
        let token = createToken(email, userInfo.business_name, userInfo.role)
        loginLink = `http://localhost:3000/auth/login-link?token=${token}`

        const mailOptions = {
            from: 'onboardingaicontact@gmail.com',
            to: email,
            subject: 'Login to Your Account',
            text: `Hello! Click the link below to log in:\n\n${loginLink}`,
          }

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return false
            }
        })
        return true

    } catch(err) {
        return false
    }
}

module.exports = { sendEmailLogin }