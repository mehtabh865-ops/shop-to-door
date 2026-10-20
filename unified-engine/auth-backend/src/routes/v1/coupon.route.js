const express = require('express');
const auth = require('../../middlewares/auth');
const couponController = require('../../controllers/coupon.controller');

const router = express.Router();

router.get('/', couponController.getCoupons);
router.get('/my-coupons', auth(), couponController.getMyCoupons);
router.post('/', auth(), couponController.createCoupon);
router.delete('/:couponId', auth(), couponController.deleteCoupon);

module.exports = router;
