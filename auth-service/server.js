const express = require('express')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRoutes)
app.use('/user', userRoutes)

app.listen(3000, () => {
    console.log(`Server running on port 3000`)
})
