const connectToDatabase = require('../db.js')
const accountManager = require('./accounts.js')
const { ObjectId } = require('mongodb');

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

    // returns true if successful
    async addPhoneNumber(business_name, phoneNumber) {
        try {
            let client = await connectToDatabase()
            let businessCollection = client.db('auth').collection('businesses')

            let exists = await this.businessExists(business_name)
            if (!exists) {
                return false
            }

            const result = await businessCollection.updateOne(
                { business_name: business_name },
                { $addToSet: { phone_numbers: phoneNumber } }
            );

            return result.modifiedCount > 0;
        } catch (err) {
            return false
        }
    }

    async getPhoneNumbers(business_name) {
        try {
            let client = await connectToDatabase()
            let businessCollection = client.db('auth').collection('businesses')
    
            let exists = await this.businessExists(business_name)
            if (!exists) {
                return false
            }
    
            const business = await businessCollection.findOne(
                { business_name: business_name },
                { projection: { phone_numbers: 1 } }
            );
    
            return business.phone_numbers
        } catch (err) {
            return false
        }
    }
    
    async deletePhoneNumber(business_name, phoneNumber) {
        try {
            let client = await connectToDatabase()
            let businessCollection = client.db('auth').collection('businesses')
    
            let exists = await this.businessExists(business_name)
            if (!exists) {
                return false
            }
    
            const result = await businessCollection.updateOne(
                { business_name: business_name },
                { $pull: { phone_numbers: phoneNumber } }
            );
    
            return result.modifiedCount > 0
        } catch (err) {
            return false
        }
    }

    async updateEmployeeEmail(business_name, employeeEmail, newEmail) {
        try {
            const client = await connectToDatabase();
            const businessCollection = client.db('auth').collection('businesses');
    
            const exists = await this.businessExists(business_name);
            if (!exists) {
                return false;
            }
    
            const result = await businessCollection.updateOne(
                { business_name: business_name, "employees.email": employeeEmail },
                { $set: { "employees.$.email": newEmail } }
            );
    
            return result.modifiedCount > 0;
        } catch (err) {
            console.error("Error updating employee email:", err);
            return false;
        }
    }
    
    async updateEmployeeName(business_name, employeeEmail, newName) {
        try {
            const client = await connectToDatabase();
            const businessCollection = client.db('auth').collection('businesses');
    
            const exists = await this.businessExists(business_name);
            if (!exists) {
                return false;
            }
    
            const result = await businessCollection.updateOne(
                { business_name: business_name, "employees.email": employeeEmail },
                { $set: { "employees.$.name": newName } }
            );
    
            return result.modifiedCount > 0;
        } catch (err) {
            console.error("Error updating employee name:", err);
            return false;
        }
    }
    

    async addEmployeeToBusiness(business_name, name, email) {
        try {
            const client = await connectToDatabase();
            const businessCollection = client.db('auth').collection('businesses');
    
            const employee = { name, email, role: "Employee" };

            const res = await businessCollection.updateOne(
                { business_name: business_name },
                { $push: { employees: employee } }
            );
    
            return res.modifiedCount > 0;
        } catch (err) {
            console.error("Error adding employee:", err);
            return false;
        }
    }
    async getLeads() {
      try {
          const client = await connectToDatabase();
          const leadsCollection = client.db('auth').collection('leads');
  
          const leads = await leadsCollection.find().toArray();
  
          return leads;
      } catch (err) {
          console.error("Error getting leads:", err);
          return [];
      }
  }
  
  async addLead(number, name) {
      try {
          const client = await connectToDatabase();
          const leadsCollection = client.db('auth').collection('leads');
  
          const newLead = {
              _number: number,
              name: name
          };
  
          const result = await leadsCollection.insertOne(newLead);
  
          return result.acknowledged;
      } catch (err) {
          console.error("Error adding lead:", err);
          return false;
      }
  }
  
  async deleteLead(leadId) {
        try {
            const client = await connectToDatabase();
            const leadsCollection = client.db('auth').collection('leads');
            
            // Ensure valid ObjectId
            if (!ObjectId.isValid(leadId)) {
                return false;
            }

            const result = await leadsCollection.deleteOne({ 
                _id: new ObjectId(leadId)
            });

            return result.deletedCount > 0;
        } catch (err) {
            console.error("Error deleting lead:", err);
            return false;
        }
    }

    async getSchedules() {
        try {
            const client = await connectToDatabase();
            const schedulesCollection = client.db('auth').collection('schedules');
    
            const schedules = await schedulesCollection.find().toArray();
    
            return schedules;
        } catch (err) {
            console.error("Error getting schedules:", err);  // Clarified error message
            return [];
        }
    }
    
    async addSchedule(name, number, date, campaign) {
        try {
            const client = await connectToDatabase();
            const schedulesCollection = client.db('auth').collection('schedules');
    
            // Ensure that the date is either a Date object or a valid ISO string
            const newSchedule = {
                name: name,
                number: number,
                date: new Date(date),  // Make sure it's a Date object if it's not already
                campaign: campaign,
            };
    
            const result = await schedulesCollection.insertOne(newSchedule);
    
            return result.acknowledged;
        } catch (err) {
            console.error("Error adding schedule:", err);  // Clarified error message
            return false;
        }
    }
    
    async deleteSchedule(scheduleId) {
        try {
            const client = await connectToDatabase();
            const schedulesCollection = client.db('auth').collection('schedules');
    
            // Ensure valid ObjectId
            if (!ObjectId.isValid(scheduleId)) {
                return false;
            }
    
            const result = await schedulesCollection.deleteOne({
                _id: new ObjectId(scheduleId),
            });
    
            return result.deletedCount > 0;
        } catch (err) {
            console.error("Error deleting schedule:", err);  // Clarified error message
            return false;
        }
    }

    async getNextAvailableTime(requestedTime) {
        try {
            const client = await connectToDatabase();
            const schedulesCollection = client.db('auth').collection('schedules');
    
            // Find all schedules after or overlapping the requested time
            const schedules = await schedulesCollection
                .find({ date: { $gte: requestedTime } })
                .sort({ date: 1 }) // Sort schedules by date in ascending order
                .toArray();
    
            // Define the slot duration (e.g., 30 minutes)
            const slotDuration = 15 * 60 * 1000; // 30 minutes in milliseconds
    
            let nextTime = new Date(requestedTime);
    
            for (const schedule of schedules) {
                const scheduleStartTime = new Date(schedule.date);
                const scheduleEndTime = new Date(scheduleStartTime.getTime() + slotDuration);
    
                // If `nextTime` overlaps with this schedule, move it to after the schedule ends
                if (nextTime < scheduleEndTime) {
                    nextTime = new Date(scheduleEndTime);
                } else {
                    // Otherwise, `nextTime` is available
                    break;
                }
            }
    
            // Return the next available time
            return nextTime;
        } catch (error) {
            console.error('Error in getNextAvailableTime:', error);
            throw error;
        }
    }
    
}

module.exports = new BusinessManager()
