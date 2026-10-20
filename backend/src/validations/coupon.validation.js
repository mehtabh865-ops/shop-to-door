const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCoupon = {
  body: Joi.object().keys({
    code: Joi.string().required().trim().uppercase(),
    description: Joi.string().allow('').optional(),
    discountType: Joi.string().valid('percentage', 'flat').default('flat'),
    discountValue: Joi.number().required().min(1),
    minOrderAmount: Joi.number().min(0).default(0),
    maxDiscount: Joi.number().min(0).optional(),
    expiryDate: Joi.date().optional(),
    usageLimit: Joi.number().integer().min(1).optional(),
  }),
};

const getShopCoupons = {
  params: Joi.object().keys({
    shopId: Joi.string().required().custom(objectId),
  }),
};

const applyCoupon = {
  body: Joi.object().keys({
    shopId: Joi.string().required().custom(objectId),
    code: Joi.string().required().trim().uppercase(),
    orderTotal: Joi.number().required().min(0),
  }),
};

const deleteCoupon = {
  params: Joi.object().keys({
    couponId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createCoupon,
  getShopCoupons,
  applyCoupon,
  deleteCoupon,
};
