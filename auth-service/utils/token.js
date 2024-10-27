const jwt = require('jsonwebtoken')
require('dotenv').config()

const secretKey = process.env.SECRET_KEY
const algorithm = process.env.ALGORITHM
const expiresIn = '1h'

function createToken(name, email, business, role) {
    const payload = { name, email, business, role }
    return jwt.sign(payload, secretKey, {algorithm, expiresIn})
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, secretKey, { algorithms: [algorithm] });
        return { valid: true, decoded };
    } catch (err) {
        return { valid: false, error: err.message };
    }
}

module.exports = {
    createToken,
    verifyToken
}
