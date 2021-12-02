let mongoose = require('mongoose')
let schema = mongoose.Schema

let ticket1Model = new schema({
    stdId: String,
    nationalCode: String,
    phoneNumber: String,
    sans: Number,
    reservationCode: Number,
    filename: String,
    vaccineLink: String
})

module.exports = mongoose.model('ticket1', ticket1Model)