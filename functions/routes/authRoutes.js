const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Weather = mongoose.model('Weather')
const User = mongoose.model('User')
const router = express.Router()

router.get('/users', async (req, res) => {
    User.find().then(user => {
        res.send(user)
    })
})

router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = new User({ email, password })
        await user.save();

        const token = jwt.sign({ userId: user._id }, '123')
        res.send({ token });        
    } catch (error) {
        return res.status(422).send(error.message)
    }
})

router.post('/weatherAPI', async(req, res) => {
    const { advisory_sinhala, advisory_tamil, drought, seasonal } = req.body;

    const weather = new Weather()
    weather.advisory.national.sinhala = advisory_sinhala;
    weather.advisory.national.tamil = advisory_tamil;
    weather.drought = drought
    weather.seasonal.seasonal = seasonal
    
    await weather.save();

    res.send('POST REQ ACCEPTED')
})

router.post('/signin', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) { return res.status(422).send({ error: 'Must Provide a Password' }) }
    
    const user = await User.findOne({ email });
    if (!user) { return res.status(422).send({ error: 'Email not found' }) }
    
    try {
        await user.comparePassword(password);
        const token = jwt.sign({ userId: user._id }, '123')
        res.send({ token });
    } catch (error) {
        return res.status(422).send({error:'Invalid Password or Email'})
    }
    
})

module.exports = router;