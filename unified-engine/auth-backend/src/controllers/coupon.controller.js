const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { couponService } = require('../services');

const getCoupons = catchAsync(async (req, res) => {
  const { shopId } = req.query;
  const coupons = await couponService.getCouponsByShopId(shopId);
  res.send(coupons);
});

const getMyCoupons = catchAsync(async (req, res) => {
  const coupons = await couponService.getMyCoupons(req.user);
  res.send(coupons);
});

const createCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.createCoupon(req.user, req.body);
  res.status(httpStatus.CREATED).send(coupon);
});

const deleteCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.deleteCoupon(req.user, req.params.couponId);
  res.send(coupon);
});

module.exports = {
  getCoupons,
  getMyCoupons,
  createCoupon,
  deleteCoupon,
};
