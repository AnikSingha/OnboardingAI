const { getDb } = require('../db.js')
const { hashPassword, checkPassword } = require('./hashing.js')
const { genSecret } = require('./otp.js')
class AccountManager {
    async userExists(email) {
        try {
            const db = await getDb();
            const userCollection = db.collection('users');
            const user = await userCollection.findOne(
                { email: email.toLowerCase() },
                { projection: { _id: 1 } }
            );
            return user !== null;
        } catch (err) {
            console.error("Error checking user existence:", err);
            return false;
        }
    }

    async addUser(name, email, password, business, role) {
        try {
            const db = await getDb();
            const userCollection = db.collection('users');
            const hashedPassword = await hashPassword(password);
            const OTPSecret = genSecret();

            const newUser = {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                business_name: business,
                role,
                OTPSecret,
                twoFactorAuth: false
            };

            const result = await userCollection.insertOne(newUser);
            return result.acknowledged;
        } catch (err) {
            console.error("Error adding user:", err);
            return false;
        }
    }

    async updateUserName(email, newName) {
        try {
            const db = await getDb();
            const userCollection = db.collection('users');

            const result = await userCollection.updateOne(
                { email: email.toLowerCase() },
                { $set: { name: newName } }
            );
            return result.acknowledged;
        } catch (err) {
            console.error("Error updating user name:", err);
            return false;
        }
    }

    async deleteUser(email) {
        try {
            const db = await getDb();
            const userCollection = db.collection('users');
            const result = await userCollection.deleteOne({ email: email.toLowerCase() });
            return result.deletedCount > 0;
        } catch (err) {
            console.error("Error deleting user:", err);
            return false;
        }
    }
    async isValidPassword(email, password) {
        try {
            const db = await getDb();
            const userCollection = db.collection('users');
            const user = await userCollection.findOne({ email: email.toLowerCase() });
            
            if (!user) return false;
            
            return await checkPassword(password, user.password);
        } catch (err) {
            console.error("Error validating password:", err);
            return false;
        }
    }

    async updatePassword(email, newPassword) {
        try {
            const db = await getDb();
            const userCollection = db.collection('users');
            const hashedPassword = await hashPassword(newPassword);

            const result = await userCollection.updateOne(
                { email: email.toLowerCase() },
                { $set: { password: hashedPassword } }
            );
            return result.acknowledged;
        } catch (err) {
            console.error("Error updating password:", err);
            return false;
        }
    }

    async updateRole(email, newRole) {
        try {
            const db = await getDb();
            const userCollection = db.collection('users');

            const result = await userCollection.updateOne(
                { email: email.toLowerCase() },
                { $set: { role: newRole } }
            );
            return result.acknowledged;
        } catch (err) {
            console.error("Error updating role:", err);
            return false;
        }
    }

    async updateBusinessName(email, newName) {
        try {
            const db = await getDb();
            const userCollection = db.collection('users');

            const result = await userCollection.updateOne(
                { email: email.toLowerCase() },
                { $set: { business_name: newName } }
            );
            return result.acknowledged;
        } catch (err) {
            console.error("Error updating business name:", err);
            return false;
        }
    }

    async updateEmail(oldEmail, newEmail) {
        try {
            let client = await getDb()
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

    async getUserInfo(email) {
        try {
            const db = await getDb();
            const userCollection = db.collection('users');
            const user = await userCollection.findOne(
                { email: email.toLowerCase() },
                { projection: { password: 0, OTPSecret: 0 } }
            );
            return user;
        } catch (err) {
            console.error("Error getting user info:", err);
            return null;
        }
    }

    async hasTwoFactor(email) {
        try {
            const db = await getDb();
            const userCollection = db.collection('users');
            const user = await userCollection.findOne(
                { email: email.toLowerCase() },
                { projection: { twoFactorAuth: 1 } }
            );
            return user?.twoFactorAuth || false;
        } catch (err) {
            console.error("Error checking two-factor status:", err);
            return false;
        }
    }

    async enableTwoFactor(email) {
        try {
            const db = await getDb();
            const userCollection = db.collection('users');
            const result = await userCollection.updateOne(
                { email: email.toLowerCase() },
                { $set: { twoFactorAuth: true } }
            );
            return result.acknowledged;
        } catch (err) {
            console.error("Error enabling two-factor:", err);
            return false;
        }
    }

    async disableTwoFactor(email) {
        try {
            const db = await getDb();
            const userCollection = db.collection('users');
            const result = await userCollection.updateOne(
                { email: email.toLowerCase() },
                { $set: { twoFactorAuth: false } }
            );
            return result.acknowledged;
        } catch (err) {
            console.error("Error disabling two-factor:", err);
            return false;
        }
    }

    async getTwoFactorSecret(email) {
        try {
            const db = await getDb();
            const userCollection = db.collection('users');
            const user = await userCollection.findOne(
                { email: email.toLowerCase() },
                { projection: { OTPSecret: 1 } }
            );
            return user?.OTPSecret;
        } catch (err) {
            console.error("Error getting two-factor secret:", err);
            return null;
        }
    }

    async verifyTwoFactorToken(email, token) {
        try {
            const secret = await this.getTwoFactorSecret(email);
            if (!secret) return false;
            
            return authenticator.verify({
                token,
                secret
            });
        } catch (err) {
            console.error("Error verifying two-factor token:", err);
            return false;
        }
    }
}

module.exports = new AccountManager();