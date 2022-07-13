const BigPromise = require('../middlewares/BigPromise')
const Order = require('../models/order')
const Product = require('../models/product')
const CustomError = require('../utils/customError')

exports.createOrder = BigPromise(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount
    } = req.body

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user:req.user._id
    })

    res.status(200).json({
        success: true
    })
    
})

exports.getOneOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email role'
    )

    if (!order) {
        return next(new CustomError('please check order ID',401))
    }

    res.status(200).json({
        success: true,
        order
    })
    
})

exports.getLoggedInOrders = BigPromise(async (req, res, next) => {
    const order = await Order.find({ user: req.user._id })
    
    if (!order) {
        return next(new CustomError('please check order ID',401))
    }

    res.status(200).json({
        success: true,
        order
    })
    
})

exports.adminGetAllOrders= BigPromise(async (req, res, next) => {
    const order = await Order.find()
    
    res.status(200).json({
        success: true,
        order
    })
    
})

exports.adminUpdateOrders = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    
    if (order.orderStatus === 'Delivered') {
        return next(new CustomError('Order is  marked for Delivered',401))
    }
    order.orderStatus = req.body.orderStatus

    order.orderItems.forEach(async prod => {
        await updateProductStock(prod.product,prod.quantity)
    })

    await order.save()

    res.status(200).json({
        success: true,
        order
    })
    
})

exports.adminDeleteOrders= BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new CustomError('Order not Found',401))
    }

    await order.remove()
    
    res.status(200).json({
        success: true,
        order
    })
    
})


// method to update stock
async function updateProductStock(productId, quantity) {
    const product = await Product.findById(productId)

    product.stock = product.stock - quantity

    await product.save({validateBeforeSave:false})
}
