const BigPromise = require('../middlewares/BigPromise')
const stripe = require("stripe")(process.env.STRIPE_SECRET)
const Razorpay = require('razorpay')

exports.sendStripeKey = BigPromise(async (req, res, next) => {
    res.status(200).json({
        stripekey: process.env.STRIPE_API_KEY
    })
})

exports.captureStripePayment = BigPromise(async (req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        payment_method_types:['card'],
        //optional
        metadata: { integration_check: 'accept_a_payment' }
        
    });

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret,
        //we can optionally send id
        id: paymentIntent.id,
        amount: req.body.amount,
        payment_method_types:paymentIntent.payment_method_types
    })
})

exports.sendRazorpayKey = BigPromise(async (req, res, next) => {
    res.status(200).json({
        stripekey: process.env.RAZORPAY_API_KEY
    })
})

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
    var instance = new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_SECRET
    })

    const myOrder = await instance.orders.create({
    amount: req.body.amount,
    currency: "INR"
    })

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        order: myOrder
    })
})