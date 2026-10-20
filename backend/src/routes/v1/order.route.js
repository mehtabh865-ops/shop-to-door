const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { orderValidation } = require('../../validations');
const { orderController } = require('../../controllers');

const router = express.Router();

// Customer: Place order & View their own orders
router.route('/').post(auth(), validate(orderValidation.createOrder), orderController.createOrder);
router.route('/my-orders').get(auth(), validate(orderValidation.getOrders), orderController.getMyOrders);

// Dukandar: View incoming orders for their shop
router.route('/shop-orders').get(auth('manageOrders'), validate(orderValidation.getOrders), orderController.getShopOrders);

// Dukandar: Update order status & Verify delivery OTP
router
  .route('/:orderId/status')
  .patch(auth('manageOrders'), validate(orderValidation.updateOrderStatus), orderController.updateOrderStatus);

router
  .route('/:orderId/verify-otp')
  .post(auth('manageOrders'), validate(orderValidation.verifyDeliveryOtp), orderController.verifyDeliveryOtp);

module.exports = router;
