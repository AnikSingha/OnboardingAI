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
    async addUser(name, email, password, business, role) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')
            let hashedPassword = await hashPassword(password)
            let OTPSecret = genSecret()

            let newUser = {
                name,
                email,
                password: hashedPassword,
                business_name: business,
                role,
                OTPSecret,
                twoFactorAuth: false
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
                { projection: { name: 1, business_name: 1, role: 1, _id: 0 } }
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

    async updateUserName(email, newName) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')
            
            const result = await userCollection.updateOne(
                { email: email },
                { $set: { name: newName } }
            )

            return result.acknowledged
        } catch (err) {
            return false
        }
    }

    async updateEmail(oldEmail, newEmail) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')
            
            const result = await userCollection.updateOne(
                { email: oldEmail },
                { $set: { email: newEmail } }
            )
            return result.acknowledged
        } catch (err) {
            return false
        }
    }
    
    async hasTwoFactor(email) {
        try {
            let client = await connectToDatabase();
            let userCollection = client.db('auth').collection('users');
    
            let user = await userCollection.findOne({ email: email });
            
            return user ? user.twoFactorAuth === true : false;
        } catch (err) {
            console.error("Error checking two-factor authentication:", err);
            return false;
        }
    }
    
    async toggleTwoFactor(email) {
        try {
            let client = await connectToDatabase();
            let userCollection = client.db('auth').collection('users');
    
            let user = await userCollection.findOne({ email: email });
            
            if (!user) {
                console.error("User not found.");
                return false;
            }
    
            let updatedTwoFactorAuth = !user.twoFactorAuth;
    
            let result = await userCollection.updateOne(
                { email: email },
                { $set: { twoFactorAuth: updatedTwoFactorAuth } }
            );
    
            return result.modifiedCount > 0;
        } catch (err) {
            console.error("Error toggling two-factor authentication:", err);
            return false;
        }
    }
    
}

module.exports = new AccountManager()
