const nodemailer = require('nodemailer')
const accountManager = require('./accounts.js')
const { createToken, createBusinessToken } = require('./token.js')
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

async function sendEmployeeSignUp(email, business) {
    try {
        let token = createBusinessToken(email, business);
        let signUpLink = `https://api.onboardingai.org/auth/employee-sign-up?businessToken=${token}`;

        const mailOptions = {
            from: 'onboardingaicontact@gmail.com',
            to: email,
            subject: `Invite from ${business} to join their OnboardAI Org`,
            html: `
                <div style="
                    font-family: Arial, sans-serif; 
                    background-color: #f8f9fa; 
                    color: #333333; 
                    padding: 20px; 
                    border-radius: 8px; 
                    border: 1px solid #e2e3e5; 
                    max-width: 600px; 
                    margin: auto;">
                    <h2 style="text-align: center; color: #333333;">
                        You've been invited to join ${business} on OnboardAI
                    </h2>
                    <p style="font-size: 16px; line-height: 1.5;">
                        Hello, you have received an invitation to join ${business}'s organization on OnboardAI.
                        Please click the button below to set up your account.
                    </p>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="${signUpLink}" style="text-decoration: none;">
                            <button style="
                                background-color: #4CAF50; 
                                border: none; 
                                color: white; 
                                padding: 12px 24px; 
                                font-size: 16px; 
                                border-radius: 6px; 
                                cursor: pointer; 
                                text-transform: uppercase;">
                                Create Account
                            </button>
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #888888; text-align: center; margin-top: 20px;">
                        If you did not request this invitation, please ignore this email.
                    </p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return false;
            }
        });
        return true;

    } catch (err) {
        return false;
    }
}


module.exports = { sendEmailLogin, sendResetPassword, sendEmployeeSignUp }