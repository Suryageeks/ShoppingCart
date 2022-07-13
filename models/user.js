const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide an name'],
        maxlength: [40,'Name should be under 40 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an Email'],
        validate: [validator.isEmail, 'Please enter an Email in correct format'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a Password'],
        minlength: [4, 'password should be atleast 4 characters'],
        select: false
    },
    role: {
        type: String,
        default: 'user'
    },
    photo: {
        id: {
            type: String,
            required:true
        },
        secure_url: {
            type: String,
            required:true
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }

})


//Encrypt Password Before Save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next()
    }
    this.password = await bcrypt.hash(this.password,10)
})

// Validating the Password with passed on user Password
userSchema.methods.isValidatedPassword = async function (usersendPassword) {
    return await bcrypt.compare(usersendPassword,this.password)
}

// Create and return JWT Token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
}

// generate forgot password token(basically a string and not jwtToken)
// userSchema.methods.getForgotPasswordToken = function () {
    
//     //generate a long and random string
//     const forgotToken = crypto.randomBytes(20).toString('hex')
   
//     //getting a hash - make sure to get a hash on backend
//     // this hash function password is just stored in database
//     // when user send forgotpassword request we just compare the
//     // the hash forgot password and crypted(above line) forgot password
//     // if matched we store it database
//     this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex')
    
//     //time of token
//     this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000

//     return forgotToken
// }

userSchema.methods.getForgotPasswordToken = function () {
    // generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString("hex");
  
    // getting a hash - make sure to get a hash on backend
    this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex");
  
    // time of token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 60 * 1000;
  
    return forgotToken;
}

module.exports = mongoose.model('User', userSchema)
