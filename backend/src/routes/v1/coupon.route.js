const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { couponValidation } = require('../../validations');
const { couponController } = require('../../controllers');

const router = express.Router();

// Dukandar: Create new coupon
router
  .route('/')
  .post(auth('manageShop'), validate(couponValidation.createCoupon), couponController.createCoupon);

// Dukandar: View own coupons
router
  .route('/my')
  .get(auth('manageShop'), couponController.getMyCoupons);

// Customer: View available coupons for a shop
router
  .route('/shop/:shopId')
  .get(validate(couponValidation.getShopCoupons), couponController.getShopCoupons);

// Customer: Validate & apply coupon code on cart
router
  .route('/apply')
  .post(validate(couponValidation.applyCoupon), couponController.applyCoupon);

// Dukandar: Toggle active status or delete coupon
router
  .route('/:couponId/toggle')
  .patch(auth('manageShop'), couponController.toggleCouponStatus);

router
  .route('/:couponId')
  .delete(auth('manageShop'), validate(couponValidation.deleteCoupon), couponController.deleteCoupon);

module.exports = router;
