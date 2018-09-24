const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-erors');
const passportLocalMongoose = require('password-local-mongoose')


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: 'Please Supply an email address'
    },
    name: {
        type: String,
        required: 'Please supply a name',
        trim: true
    },
    password: {
        type: String,
        required: 'Please supply a name',
        trim: true
    }
})
userSchema.plugin(passportLocalMongoose, {
    userField: 'email'
})
userSchema.plugin(mongodbErrorHandler)
module.exports = mongoose.model('User', userSchema)