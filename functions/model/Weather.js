const mongoose = require('mongoose')

const weatherSchema = new mongoose.Schema({
    advisory: {
        national: {
            sinhala: { type: String },
            tamil:{type:String}
        }
    },
    tank: {
        thanamalvila: { type: String },
        thunukai:{type:String}
    },
    rainfall_analysis: {
        monaragala: { type: String },
        mulaitivu:{type:String}
    },
    weather_around_you: {
        alutwewa: { type: String },
        kota: { type: String },
        iyankan: { type: String },
        uliyan: { type: String },
        puth: { type: String }
    },
    drought: { type: String },
    seasonal: {
        short: {
            sinhala: { type: String },
            tamil:{type:String}
        },
        medium: {type:String},
        seasonal:{type:String}
    }
})

mongoose.model('Weather', weatherSchema)