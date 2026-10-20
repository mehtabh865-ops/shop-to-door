const express = require('express');
const auth = require('../../middlewares/auth');
const orderController = require('../../controllers/order.controller');

const router = express.Router();

router.post('/', auth(), orderController.createOrder);
router.get('/my-orders', auth(), orderController.getMyOrders);
router.get('/dukandar-orders', auth(), orderController.getDukandarOrders);
router.patch('/:orderId/status', auth(), orderController.updateOrderStatus);
router.post('/:orderId/verify-otp', auth(), orderController.verifyOtp);

module.exports = router;
