let mongoose = require('mongoose')
let schema = mongoose.Schema

let ticket2Model = new schema({
    stdId: String,
    nationalCode: String,
    phoneNumber: String,
    reservationCode: Number,
    filename: String,
    vaccineLink: String,
    name:String,
    lname:String
})

module.exports = mongoose.model('ticket2', ticket2Model)