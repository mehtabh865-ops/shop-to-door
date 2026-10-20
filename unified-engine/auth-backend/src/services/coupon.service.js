const httpStatus = require('http-status');
const { Coupon, Shop } = require('../models');
const ApiError = require('../utils/ApiError');

const createCoupon = async (user, couponBody) => {
  const shop = await Shop.findOne({ ownerId: user._id || user.id });
  if (!shop) throw new ApiError(httpStatus.BAD_REQUEST, 'Shop not found');

  return Coupon.create({
    shopId: shop._id,
    code: (couponBody.code || '').toUpperCase().trim(),
    discountPercent: couponBody.discountPercent,
    maxDiscount: couponBody.maxDiscount || 100,
    minOrderAmount: couponBody.minOrderAmount || 0,
    isActive: couponBody.isActive !== undefined ? couponBody.isActive : true,
  });
};

const getCouponsByShopId = async (shopId) => {
  return Coupon.find({ shopId, isActive: true });
};

const getMyCoupons = async (user) => {
  const shop = await Shop.findOne({ ownerId: user._id || user.id });
  if (!shop) return [];
  return Coupon.find({ shopId: shop._id });
};

const deleteCoupon = async (user, couponId) => {
  const shop = await Shop.findOne({ ownerId: user._id || user.id });
  if (!shop) throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: Shop not found');
  const coupon = await Coupon.findOne({ _id: couponId, shopId: shop._id });
  if (!coupon) throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found');
  if (coupon.deleteOne) await coupon.deleteOne();
  else await coupon.remove();
  return coupon;
};

module.exports = {
  createCoupon,
  getCouponsByShopId,
  getMyCoupons,
  deleteCoupon,
};
