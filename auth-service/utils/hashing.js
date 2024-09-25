const bcrypt = require('bcrypt')
const saltRounds = 10

async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(saltRounds)
        const hash = await bcrypt.hash(password, salt)
        return hash
    } catch (err) {
        throw new Error('Error hashing password: ' + err.message);
    }
}

async function checkPassword(password, hash) {
    try {
        const match = await bcrypt.compare(password, hash);
        return match;
    } catch (err) {
        throw new Error('Error checking password: ' + err.message);
    }
}

module.exports = {
    hashPassword,
    checkPassword
}