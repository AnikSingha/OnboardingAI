const connectToDatabase = require('../db.js')
const { hashPassword, checkPassword } = require('./hashing.js')
const { genSecret } = require('./otp.js')
class AccountManager {

    // returns true if user exists
    async userExists(email) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')

            let res = await userCollection.findOne(
                { email }, 
                { projection: { _id: 1 } }
            )

            return res !== null
        } catch (err) {
            return false
        }
    }

    // returns true if successful
    async addUser(email, password, business, role) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')
            let hashedPassword = await hashPassword(password)
            let OTPSecret = genSecret()

            let newUser = {
                email,
                password: hashedPassword,
                business_name: business,
                role,
                OTPSecret
            }

            let res = await userCollection.insertOne(newUser) // add new user
            return res.acknowledged
        } catch (err) {
            return false
        }
    }

    // returns true if update was successful
    async updatePassword(email, newPassword) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')
            let hashedPassword = await hashPassword(newPassword)

            let res = await userCollection.updateOne(
                { email },
                { $set: { password: hashedPassword } } // update the password field
            )

            return res.acknowledged
        } catch (err) {
            return false
        }
    }

    // returns true if update was successful
    async updateRole(email, newRole) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')

            let res = await userCollection.updateOne(
                { email },
                { $set: { role: newRole } } // update the role field
            )

            return res.acknowledged
        } catch (err) {
            return false
        }
    }

    // returns true if update was successful
    async updateBusinessName(email, newName) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')

            let res = await userCollection.updateOne(
                { email },
                { $set: { business_name: newName } }
            )

            return res.acknowledged
        } catch (err) {
            return false
        }
    }

    // returns true if user was successfully deleted
    async deleteUser(email) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')

            let res = await userCollection.deleteOne({ email })
            return res.acknowledged

        } catch (err) {
            return false
        }
    }

    // returns true if password is valid
    async isValidPassword(email, password) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')
            let hashedPassword = await userCollection.findOne(
                { email },
                { projection: { password: 1 } }
            )

            if (!hashedPassword) {
                return false // User doesn't exist
            }

            let res = await checkPassword(password, hashedPassword.password)
            return res

        } catch (err) {
            return false
        }
    }

    // returns the corresponding business_name and role of the user
    async getUserInfo(email) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')
    
            let result = await userCollection.findOne(
                { email },
                { projection: { business_name: 1, role: 1, _id: 0 } }
            )
    
            if (result && result.business_name && result.role) {
                return result
            } else {
                return ''
            }
            
        } catch (err) {
            return ''
        }
    }

    async getOTPSecret(email) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')
            
            let result = await userCollection.findOne(
                { email },
                { projection: { OTPSecret: 1, _id: 0 } }
            )

            if (result && result.OTPSecret){
                return result.OTPSecret
            } else {
                return ''
            }
            
        } catch (err) {
            return ''
        }
    }
}

module.exports = new AccountManager()