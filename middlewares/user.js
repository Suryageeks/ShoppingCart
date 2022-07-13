const User = require('../models/user')
const BigPromise = require('../middlewares/BigPromise')
const CustomError = require('../utils/customError')
const jwt = require('jsonwebtoken')

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    const token = req.cookies.token 
    
    if (!token) {
        return next(new CustomError('Login First to Access this Page',401))
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    
    //injecting the middleware in req.user
    req.user = await User.findById(decoded.id)

    next()
})

exports.customRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new CustomError('You are not allowed for this resource',403))
        }
        next()
    }

    //alternative
    // if (req.user.role === 'admin') {
    //     next()
    // }
}