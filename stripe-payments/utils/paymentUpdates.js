const { getDb } = require('../../auth-service/db.js')
const businessManager = require('../../auth-service/utils/businessManager.js')

async function updatePlan(business_name, plan, credits) {
    try {
        const db = await getDb();
        const businessCollection = db.collection('businesses');

        const result = await businessCollection.updateOne(
            { business_name }, 
            {
                $set: { 
                    isSubscribed: true,
                    currentPlan: plan
                },
                $inc: { 
                    credits: credits
                }
            }
        );

        if (result.modifiedCount > 0) {
            console.log('Business plan updated successfully');
            return true;
        } else {
            console.log('No document found or no changes made');
            return false;
        }
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function addCredits(business_name, credits) {
    try {
        const db = await getDb();
        const businessCollection = db.collection('businesses');

        const result = await businessCollection.updateOne(
            { business_name },
            {
                $inc: { credits }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`${credits} credits added to ${business_name}`);
            return true;
        } else {
            console.log('No document found or no changes made');
            return false;
        }
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function decrementCredits(business_name, credits) {
    try {
        const db = await getDb();
        const businessCollection = db.collection('businesses');

        const result = await businessCollection.updateOne(
            { business_name },
            {
                $inc: { credits: -credits }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`${credits} credits deducted from ${business_name}`);
            return true;
        } else {
            console.log('No document found or no changes made');
            return false;
        }
    } catch (err) {
        console.error(err);
        return false;
    }
}

module.exports = { updatePlan, addCredits, decrementCredits }