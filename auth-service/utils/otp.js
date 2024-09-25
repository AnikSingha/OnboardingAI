const { authenticator } = require('otplib');
const qrcode = require('qrcode');

function genSecret() {
    const secret = authenticator.generateSecret()
    return secret
}

function verifyOTP(token, secret) {
    const isValid = authenticator.check(token, secret)
    return isValid
}

async function genQRCode(user, secret) {
    const otpUrl = authenticator.keyuri(user, 'OnboardingAI', secret)

    const options = {
        width: 400, 
        errorCorrectionLevel: 'H'
    };

    try {
        const qrCodeDataURL = await qrcode.toDataURL(otpUrl, options)
        return qrCodeDataURL
    } catch (err) {
        throw new Error('Error creating QR code: ' + err.message)
    }
}

module.exports = {
    genSecret,
    verifyOTP,
    genQRCode
}