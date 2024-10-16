const connectToDatabase = require('../db.js')
const accountManager = require('./accounts.js')

class BusinessManager {

    // returns true if business was created
    async createBusiness(business, employees, phone_numbers) {
        try {
            let client = await connectToDatabase()
            let businessCollection = client.db('auth').collection('businesses')

            let newBusiness = {
                business_name: business,
                employees,
                phone_numbers
            }

            let res = await businessCollection.insertOne(newBusiness)
            return res.acknowledged
        } catch (err) {
            return false
        }
    }

    // returns true if business exists
    async businessExists(business_name) {
        try {
            let client = await connectToDatabase()
            let businessCollection = client.db('auth').collection('businesses')
            
            let result = await businessCollection.findOne(
                { business_name },
                { projection: { _id: 0 } }
            );

            return result !== null
            
        } catch (err) {
            console.error("Error checking if business exists:", err)
        } 
    }


    // returns true if update was successful
    async updateBusinessName(business_name, newName) {
        try {
            let client = await connectToDatabase()
            let businessCollection = client.db('auth').collection('businesses')

            let exists = await this.businessExists(newName)
            if (exists) {
                return false
            }
            
            let employees = await this.getEmployees(business_name)

            let res = await businessCollection.updateOne(
                { business_name },
                { $set: { business_name: newName } }
            )

            await Promise.all(
                employees.map(employee => accountManager.updateBusinessName(employee, newName))
            );

            return res.acknowledged
        } catch (err) {
            return false
        }
    }

    // returns the emails of all employees belonging to a business
    async getEmployees(business_name) {
        try {
            let client = await connectToDatabase()
            let businessCollection = client.db('auth').collection('businesses')

            let business = await businessCollection.findOne(
                { business_name },
                { projection: { employees: 1, _id: 0 } }
            )

            return business?.employees || []
        } catch (err) {
            return []
        }
    }

    // deletes every user under this business
    async deleteBusiness(businessName) {
        try {
            let client = await connectToDatabase()
            let businessCollection = client.db('auth').collection('businesses')
            
            let exists = await this.businessExists(businessName)
            if (!exists) {
                return false
            }

            const employees = await this.getEmployees(businessName)

            await Promise.all(employees.map(async (employee) => {
                await accountManager.deleteUser(employee)
            }))
            
            await businessCollection.deleteOne({ business_name: businessName });

            return true

        } catch (err) {
            return false
        }
    }

}

module.exports = new BusinessManager()