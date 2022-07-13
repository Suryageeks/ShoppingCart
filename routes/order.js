const express = require('express')
const { createOrder, getOneOrder, getLoggedInOrders, adminGetAllOrders, adminUpdateOrders, adminDeleteOrders } = require('../controllers/orderController')
const router = express.Router()
const { isLoggedIn, customRole } = require('../middlewares/user')

// its always better to :id routes in last  rows so to avoid any issue

router.route('/order/create').post(isLoggedIn, createOrder)
router.route('/order/myorder').get(isLoggedIn,getLoggedInOrders)
router.route('/order/:id').get(isLoggedIn, getOneOrder)

//admin routes
router.route('/admin/orders').get(isLoggedIn, customRole('admin'), adminGetAllOrders)
router.route('/admin/orders/:id')
    .put(isLoggedIn, customRole('admin'), adminUpdateOrders)
    .delete(isLoggedIn, customRole('admin'), adminDeleteOrders)





module.exports = router

