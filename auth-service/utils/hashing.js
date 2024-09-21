const bcrypt = require('bcrypt')
const saltRounds = 10

async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(saltRounds)
        const hash = await bcrypt.hash(password, salt)
        return hash
    } catch (error) {
        throw new Error('Error hashing password: ' + error.message);
    }
}

async function checkPassword(password, hash) {
    try {
        const match = await bcrypt.compare(password, hash);
        return match;
    } catch (error) {
        throw new Error('Error checking password: ' + error.message);
    }
}

module.exports = {
    hashPassword,
    checkPassword
}