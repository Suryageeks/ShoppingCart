const User = require('../models/user')
const BigPromise = require('../middlewares/BigPromise')
const CustomError = require('../utils/customError')
const cookieToken = require('../utils/cookieToken')
const fileUpload =require('express-fileupload')
const cloudinary = require('cloudinary')
const mailHelper = require('../utils/emailhelper')
const crypto = require('crypto')

exports.signup = BigPromise(async (req, res, next) => {
    // res.send('Signup Route')
    
    //checking if file is present or not
    if (!req.files) {
        return next(new CustomError('photo is required for signup',400))
    }
    
    //checking credentials
    const { name, email, password } = req.body
    
    if (!email || !name || !password) {
        return next(new Error('Name , Email and Password Required'))
    }
 
    // for storing the files
    let file = req.files.photo
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: 'users',
        width: 150,
        crop:'scale'
    })
  
    //To save data in database
    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    })

    cookieToken(user,res);
})

exports.login = BigPromise(async (req, res, next) => {
    const { email, password } = req.body
    
    //checking email and password present
    if (!email || !password) {
        return next(new CustomError('please provide email and password',400))
    }

    //get user from DB
    const user = await User.findOne({ email }).select('+password')
    
    //if user not found in DB
    if (!user) {
        return next(new CustomError('Email or password doesnt exist',400))
    }

    // matching the password
    const isPasswordCorrect = await user.isValidatedPassword(password)

    //if password do not match
    if (!isPasswordCorrect) {
        return next(new CustomError('Email or password doesnt exist',400))
    }

    //sending the cookie token
    cookieToken(user,res);

})

exports.logout = BigPromise(async (req, res, next) => {
    res.clearCookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly:true
    }).status(200).json({
        success: true,
        message:'Logout success'
    })


})

// exports.forgotPassword = BigPromise(async (req, res, next) => {
//     const { email } = req.body
    
//     const users = User.findOne({ email })

//     if (!users) {
//         return next(new CustomError('Email not registered',400))
//     }
    
//     //const forgotToken = users.getForgotPasswordToken()

//     const forgotToken  = await users.getForgotPasswordToken()
//     //console.log("------------>",forgotToken);

//     //it will save the data before validating it..
//     await users.save({ validateBeforeSave: false })
    
//     const myurl = `${req.protocol}://${req.get('host')}/password/reset/${forgotToken}`

//     const message = 'Copy paste this link in url and hit enter \n\n ${myurl}'

//     //to trigger the sending of email
//     try {
//         await mailHelper({
//             email: email,
//             subject: 'Tstore - Password Reset Link ',
//             message
//         })

//         res.status(200).json({
//             success: true,
//             message:'Email sent successfully'
//         })
//     }
//     catch (error) {
//         users.forgotPasswordToken = undefined
//         users.forgotPasswordExpiry = undefined
//         await users.save({ validateBeforeSave: false })
        
//         return next(new CustomError(error.message,500))
//     }
// })

exports.forgotPassword = BigPromise(async (req, res, next) => {
    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user){
      next(new CustomError("Email not found"));
    }

    const forgotToken  = await user.getForgotPasswordToken()
      console.log("------------>",forgotToken);
   await user.save({validateBeforeSave:false})
      try {
          const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;
          const message = `please hit this url ${myUrl}`;
          await mailHelper({
            email:user.email,
            subject:"tstore password reset email",
            message
          })
          res.status(200).json({success:true,message:"email send succesfully"});
      } catch (error) {
        console.log("error---->",error);
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined; ;
        await user.save({validateBeforeSave:false})
        return next(new CustomError(error.message,500));
      }

})

exports.passwordReset = BigPromise(async (req, res, next) => {
    const token = req.params.token

    const encrytoken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        encrytoken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })

    if (!user) {
        return next(new CustomError('Token has expired or invalid',400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new CustomError('Password and Confirm Password do not match',400))
    }

    user.password = req.body.password

    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    await user.save()

    // send a json response or send token
    cookieToken(user,res);

})

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        user
    })
})

//this is applied when user is already logged in and want to change password
exports.changePassword = BigPromise(async (req, res, next) => {
    const userId = req.user.id

    const user = await User.findById(userId).select('+password')

    const isCorrectOldPassword = user.isValidatedPassword(req.body.oldPassword)

    if (!isCorrectOldPassword) {
        return next(new CustomError('Old password Do not match',400))
    }

    user.password = req.body.password

    await user.save()

    cookieToken(user,res)

})

exports.updateUserDetails = BigPromise(async (req, res, next) => {
    
    const { name, email } = req.body

    if (!name || !email) {
        return next(new CustomError('Name or Email should be present',400))
    }
    
    const newData = {
        name: name,
        email: email,
    }

    if (req.files) {
        const user = await User.findById(req.user.id)
        
        const imageId = user.photo.id

        //delete photo on cloudinary
        const resp = await cloudinary.v2.uploader.destroy(imageId)

        //uploading new photo
        const result = await cloudinary.v2.uploader.upload(req.files.photos.tempFilePath, {
            folder: 'users',
            width: 150,
            crop:'scale'
        })

        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        user
    })
})

exports.adminAllUser = BigPromise(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        success: true,
        users
    })
})

exports.admingetOneUser = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new CustomError('No user found',400))
    }
    res.status(200).json({
        success: true,
        user
    })

})

exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) => {
    
    const { name, email } = req.body

    
    
    const newData = {
        name: name,
        email: email,
        role : req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        user
    })
})

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
    // get user from url
    const user = await User.findById(req.params.id);
  
    if (!user) {
      return next(new CustomError("No Such user found", 401));
    }
  
    // get image id from user in database
    const imageId = user.photo.id;
  
    // delete image from cloudinary
    await cloudinary.v2.uploader.destroy(imageId);
  
    // remove user from databse
    await user.remove();
  
    res.status(200).json({
      success: true,
    });
});

exports.managerAllUser = BigPromise(async (req, res, next) => {
    const users = await User.find({role:'user'})

    res.status(200).json({
        success: true,
        users
    })
})