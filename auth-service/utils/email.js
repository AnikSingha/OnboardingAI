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
        let { name, business_name, role} = await accountManager.getUserInfo(email)
        let token = createToken(name, email, business_name, role)
        let loginLink = `https://api.onboardingai.org/auth/login-link?token=${token}`

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

async function sendResetPassword(email) {
    try {
        let { name, business_name, role} = await accountManager.getUserInfo(email)
        let token = createToken(name, email, business_name, role);
        let loginLink = `https://api.onboardingai.org/auth/reset-password?token=${token}`;

        const mailOptions = {
            from: 'onboardingaicontact@gmail.com',
            to: email,
            subject: 'Login to Your Account',
            html: `
                <p>Hello, you are receiving this email because we received a request to reset the 
                password of the account associated with this email. If you did not make this request
                then please change your password</p>
                <p>Click the button below to reset your password:</p>
                <a href="${loginLink}" style="text-decoration: none;">
                    <button style="
                        background-color: #4CAF50; /* Green */
                        border: none;
                        color: white;
                        padding: 15px 32px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;
                        border-radius: 5px;">
                        Reset Password
                    </button>
                </a>
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return false;
            }
        });
        return true;

    } catch(err) {
        return false;
    }
}


module.exports = { sendEmailLogin, sendResetPassword }