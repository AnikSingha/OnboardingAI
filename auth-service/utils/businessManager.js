const { getDb, getLeads, addLead, deleteLead } = require('../db.js');
const accountManager = require('./accounts.js');
const { ObjectId } = require('mongodb');

class BusinessManager {
    async createBusiness(business, employees, phone_numbers) {
        try {
            const db = await getDb();
            const businessCollection = db.collection('businesses');
            const newBusiness = {
                business_name: business,
                employees,
                phone_numbers
            };
            const res = await businessCollection.insertOne(newBusiness);
            return res.acknowledged;
        } catch (err) {
            console.error("Error creating business:", err);
            return false;
        }
    }

    async businessExists(business_name) {
        try {
            const db = await getDb();
            const businessCollection = db.collection('businesses');
            const result = await businessCollection.findOne(
                { business_name },
                { projection: { _id: 0 } }
            );
            return result !== null;
        } catch (err) {
            console.error("Error checking if business exists:", err);
            return false;
        }
    }

    async updateBusinessName(business_name, newName) {
        try {
            const db = await getDb();
            const businessCollection = db.collection('businesses');
            
            const exists = await this.businessExists(newName);
            if (exists) {
                return false;
            }
            
            const employees = await this.getEmployees(business_name);
            const res = await businessCollection.updateOne(
                { business_name },
                { $set: { business_name: newName } }
            );
            
            await Promise.all(
                employees.map(employee => accountManager.updateBusinessName(employee, newName))
            );
            
            return res.acknowledged;
        } catch (err) {
            console.error("Error updating business name:", err);
            return false;
        }
    }

    async getEmployees(business_name) {
        try {
            const db = await getDb();
            const businessCollection = db.collection('businesses');
            const business = await businessCollection.findOne(
                { business_name },
                { projection: { employees: 1, _id: 0 } }
            );
            return business?.employees || [];
        } catch (err) {
            console.error("Error getting employees:", err);
            return [];
        }
    }

    async deleteBusiness(businessName) {
        try {
            const db = await getDb();
            const businessCollection = db.collection('businesses');
            
            const exists = await this.businessExists(businessName);
            if (!exists) {
                return false;
            }
            
            const employees = await this.getEmployees(businessName);
            await Promise.all(employees.map(async (employee) => {
                await accountManager.deleteUser(employee);
            }));
            
            await businessCollection.deleteOne({ business_name: businessName });
            return true;
        } catch (err) {
            console.error("Error deleting business:", err);
            return false;
        }
    }

    async addPhoneNumber(business_name, phoneNumber) {
        try {
            const db = await getDb();
            const businessCollection = db.collection('businesses');
            
            const exists = await this.businessExists(business_name);
            if (!exists) {
                return false;
            }
            
            const result = await businessCollection.updateOne(
                { business_name: business_name },
                { $addToSet: { phone_numbers: phoneNumber } }
            );
            return result.modifiedCount > 0;
        } catch (err) {
            console.error("Error adding phone number:", err);
            return false;
        }
    }

    async getPhoneNumbers(business_name) {
        try {
            const db = await getDb();
            const businessCollection = db.collection('businesses');
            
            const exists = await this.businessExists(business_name);
            if (!exists) {
                return [];
            }
            
            const business = await businessCollection.findOne(
                { business_name: business_name },
                { projection: { phone_numbers: 1 } }
            );
            return business.phone_numbers;
        } catch (err) {
            console.error("Error getting phone numbers:", err);
            return [];
        }
    }

    async deletePhoneNumber(business_name, phoneNumber) {
        try {
            const db = await getDb();
            const businessCollection = db.collection('businesses');
            
            const exists = await this.businessExists(business_name);
            if (!exists) {
                return false;
            }
            
            const result = await businessCollection.updateOne(
                { business_name: business_name },
                { $pull: { phone_numbers: phoneNumber } }
            );
            return result.modifiedCount > 0;
        } catch (err) {
            console.error("Error deleting phone number:", err);
            return false;
        }
    }

    async updateEmployeeEmail(business_name, employeeEmail, newEmail) {
        try {
            const db = await getDb();
            const businessCollection = db.collection('businesses');
            
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
            const db = await getDb();
            const businessCollection = db.collection('businesses');
            
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
            const db = await getDb();
            const businessCollection = db.collection('businesses');
            
            const employee = { name, email, role: "Employee" };
            const result = await businessCollection.updateOne(
                { business_name: business_name },
                { $push: { employees: employee } }
            );
            return result.modifiedCount > 0;
        } catch (err) {
            console.error("Error adding employee:", err);
            return false;
        }
    }

    async deleteEmployeeFromBusiness(business_name, email) {
        try {
            const db = await getDb();
            const businessCollection = db.collection('businesses');
            
            const result = await businessCollection.updateOne(
                { business_name: business_name },
                { $pull: { employees: { email: email } } }
            );
            return result.modifiedCount > 0;
        } catch (err) {
            console.error("Error deleting employee:", err);
            return false;
        }
    }    

    async getPlanAndCredits(business_name) {
        try {
            const db = await getDb();
            const businessCollection = db.collection('businesses');
    
            const business = await businessCollection.findOne({ business_name });
    
            if (!business) {
                console.log(`Business with name ${business_name} not found`);
                return false;
            }
    
            return { credits: business.credits, currentPlan: business.currentPlan }
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    

    async getLeads() {
        try {
            return await getLeads();
        } catch (err) {
            console.error("Error getting leads:", err);
            return [];
        }
    }

    async addLead(number, name) {
        try {
            return await addLead(number, name);
        } catch (err) {
            console.error("Error adding lead:", err);
            return false;
        }
    }

    async deleteLead(leadId) {
        try {
            return await deleteLead(leadId);
        } catch (err) {
            console.error("Error deleting lead:", err);
            return false;
        }
    }

    async getSchedules() {
        try {
            const db = await getDb();
            const schedulesCollection = db.collection('schedules');
            const schedules = await schedulesCollection.find().toArray();
            return schedules;
        } catch (err) {
            console.error("Error getting schedules:", err);
            return [];
        }
    }

    async addSchedule(name, number, date) {
        try {
            const db = await getDb();
            const schedulesCollection = db.collection('schedules');
            
            const newSchedule = {
                name: name,
                number: number,
                date: new Date(date),
            };
            
            const result = await schedulesCollection.insertOne(newSchedule);
            return result.acknowledged;
        } catch (err) {
            console.error("Error adding schedule:", err);
            return false;
        }
    }
    async deleteSchedule(scheduleId) {
      try {
        if (!ObjectId.isValid(scheduleId)) {
          return false;
        }
        const db = await getDb();
        const scheduleIdsCollection = db.collection('schedules');
        const result = await scheduleIdsCollection.deleteOne({
          _id: new ObjectId(scheduleId)
        });
        return result.deletedCount > 0;
      } catch (error) {
        console.error('Error deleting lead:', error);
        throw error;
      }
    }
}

module.exports = new BusinessManager();
