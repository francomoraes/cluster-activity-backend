const express = require('express')
const cors = require('cors')
const db = require('./db/db')

const app = express()

// Config dotenv
require('dotenv').config()

// Config JSON response
app.use(express.json())

// Config CORS
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}))

// Public folder for static assets
app.use(express.static('public'))

// Routes
const UserRoutes = require('./routes/UserRoutes')

app.use('/users', UserRoutes)

db
// .sync({force: true}).then(() => {
    .sync().then(() => {
        app.listen(5000, () => {
            console.log('Server is running on port 5000')
        })
    }).catch((error) => {
        console.log('Error: ', error)
    })
