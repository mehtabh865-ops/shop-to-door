const httpStatus = require('http-status');
const { Coupon, Shop } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new store coupon (Dukandar action)
 * @param {ObjectId} ownerId
 * @param {Object} couponBody
 * @returns {Promise<Coupon>}
 */
const createCoupon = async (ownerId, couponBody) => {
  const shop = await Shop.findOne({ owner: ownerId });
  if (!shop) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please create your shop profile first');
  }

  const existing = await Coupon.findOne({ shop: shop._id, code: couponBody.code.toUpperCase() });
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'A coupon with this code already exists for your store');
  }

  const coupon = await Coupon.create({
    ...couponBody,
    code: couponBody.code.toUpperCase(),
    shop: shop._id,
    owner: ownerId,
  });

  return coupon;
};

/**
 * Get coupons created by logged in Dukandar
 * @param {ObjectId} ownerId
 * @returns {Promise<QueryResult>}
 */
const getMyCoupons = async (ownerId, filter = {}, options = {}) => {
  const finalFilter = { ...filter, owner: ownerId };
  return Coupon.paginate(finalFilter, options);
};

/**
 * Get active coupons for a shop (Customer View)
 * @param {ObjectId} shopId
 * @returns {Promise<QueryResult>}
 */
const getShopCoupons = async (shopId) => {
  const coupons = await Coupon.find({ shop: shopId, isActive: true });
  return coupons;
};

/**
 * Validate and calculate discount for a customer cart
 * @param {ObjectId} shopId
 * @param {string} code
 * @param {number} orderTotal
 * @returns {Promise<Object>}
 */
const validateAndApplyCoupon = async (shopId, code, orderTotal) => {
  const coupon = await Coupon.findOne({
    shop: shopId,
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired coupon code for this shop');
  }

  if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Minimum order amount to use coupon ${coupon.code} is Rs. ${coupon.minOrderAmount}`
    );
  }

  if (coupon.expiryDate && new Date() > coupon.expiryDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This coupon has expired');
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This coupon usage limit has been reached');
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (orderTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  // Ensure discount doesn't exceed order total
  discountAmount = Math.min(discountAmount, orderTotal);
  const finalAmount = orderTotal - discountAmount;

  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: Math.round(discountAmount),
    finalAmount: Math.round(finalAmount),
    couponId: coupon._id,
  };
};

/**
 * Toggle coupon active status
 * @param {ObjectId} ownerId
 * @param {ObjectId} couponId
 * @returns {Promise<Coupon>}
 */
const toggleCouponStatus = async (ownerId, couponId) => {
  const coupon = await Coupon.findOne({ _id: couponId, owner: ownerId });
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found or permission denied');
  }
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  return coupon;
};

/**
 * Delete coupon
 * @param {ObjectId} ownerId
 * @param {ObjectId} couponId
 * @returns {Promise<Coupon>}
 */
const deleteCoupon = async (ownerId, couponId) => {
  const coupon = await Coupon.findOne({ _id: couponId, owner: ownerId });
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found or permission denied');
  }
  await coupon.deleteOne();
  return coupon;
};

module.exports = {
  createCoupon,
  getMyCoupons,
  getShopCoupons,
  validateAndApplyCoupon,
  toggleCouponStatus,
  deleteCoupon,
};
