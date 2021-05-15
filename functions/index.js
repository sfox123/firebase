require('./model/Weather')
require('./model/User')
const functions = require("firebase-functions");
const admin = require('firebase-admin')
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const auth = require('./routes/authRoutes')
const requireAuth = require('./middleware/requireAuth')

const app = express()
admin.initializeApp(functions.config().firebase)
const mongoURi = 'mongodb+srv://admin:Awsedrf1.@cluster0.ojv71.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
app.use(bodyParser.json());

mongoose.connect(mongoURi, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology:true
})

mongoose.connection.on('connected', () => {
    console.log('Connected to Mongo DB')
})

mongoose.connection.on('error', (err) => {
    console.error(err)
})


app.use(auth)

app.get('/', (req, res) => {
  res.send('Weather Details On the Way')  
})

app.get('/Auth', requireAuth, (req, res) => {
    res.send(`Your email is ${req.user.email}`)
})


exports.app = functions.https.onRequest(app)