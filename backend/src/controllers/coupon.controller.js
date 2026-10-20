const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { couponService } = require('../services');

const createCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.createCoupon(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(coupon);
});

const getMyCoupons = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['isActive']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await couponService.getMyCoupons(req.user.id, filter, options);
  res.send(result);
});

const getShopCoupons = catchAsync(async (req, res) => {
  const coupons = await couponService.getShopCoupons(req.params.shopId);
  res.send(coupons);
});

const applyCoupon = catchAsync(async (req, res) => {
  const { shopId, code, orderTotal } = req.body;
  const result = await couponService.validateAndApplyCoupon(shopId, code, orderTotal);
  res.send(result);
});

const toggleCouponStatus = catchAsync(async (req, res) => {
  const coupon = await couponService.toggleCouponStatus(req.user.id, req.params.couponId);
  res.send(coupon);
});

const deleteCoupon = catchAsync(async (req, res) => {
  await couponService.deleteCoupon(req.user.id, req.params.couponId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createCoupon,
  getMyCoupons,
  getShopCoupons,
  applyCoupon,
  toggleCouponStatus,
  deleteCoupon,
};
