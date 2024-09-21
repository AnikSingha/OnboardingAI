const connectToDatabase = require('./db.js')
const { hashPassword, checkPassword } = require('./utils/hashing.js')

class AccountManager {
    // returns true if successful
    async addUser(email, password, business, role) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')
            let hashedPassword = await hashPassword(password)

            let newUser = {
                email,
                password: hashedPassword,
                business_name: business,
                role
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

    // returns the emails of all employees belonging to a business
    async getBusinessEmployees(businessName) {
        try {
            let client = await connectToDatabase()
            let userCollection = client.db('auth').collection('users')

            let employees = await userCollection.find(
                { business_name: businessName },
                { projection: { email: 1 } }
            ).toArray()

            return employees.map(employee => employee.email)
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

    // deletes every user under this business
    async deleteBusiness(businessName) {
        try {
            const employees = await this.getBusinessEmployees(businessName)

            await Promise.all(employees.map(async (employee) => {
                await this.deleteUser(employee)
            }))

            return true

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
}

module.exports = new AccountManager()
