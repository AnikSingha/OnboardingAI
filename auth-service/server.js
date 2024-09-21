const express = require('express')
const cookieParser = require('cookie-parser');
const accountManager = require('./utils/accounts.js')
const { createToken, verifyToken } = require('./utils/token.js')

const app = express()
app.use(express.json());
app.use(cookieParser())

app.post('/sign-up', async (req, res) => {
    try {
        let { email, password, business_name, role } = req.body
        let exists = await accountManager.userExists(email)
        
        if (exists){
            return res.status(409).json({ success: false, message: 'User already Exists' })
        }

        let success = await accountManager.addUser(email, password, business_name, role)

        if (success) {
            let token = createToken(email, business_name, role)
            res.cookie('token', token, { httpOnly: true })
            return res.status(201).json({ success: true, message: 'Success' })
        } else {
            return res.status(400).json({ success: false, message: 'User creation failed' })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
})


app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${3000}`);
});