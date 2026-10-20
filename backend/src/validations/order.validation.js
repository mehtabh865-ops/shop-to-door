const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { orderStatuses } = require('../models/order.model');

const createOrder = {
  body: Joi.object().keys({
    shopId: Joi.string().required().custom(objectId),
    items: Joi.array()
      .items(
        Joi.object().keys({
          productId: Joi.string().required().custom(objectId),
          quantity: Joi.number().integer().min(1).required(),
        })
      )
      .min(1)
      .required(),
    deliveryAddress: Joi.object()
      .keys({
        recipientName: Joi.string().required(),
        phone: Joi.string().required(),
        street: Joi.string().required(),
        landmark: Joi.string().allow('').optional(),
        city: Joi.string().allow('').optional(),
        pincode: Joi.string().required(),
      })
      .required(),
    paymentMethod: Joi.string().valid('cod', 'upi', 'card').default('cod'),
  }),
};

const getOrders = {
  query: Joi.object().keys({
    status: Joi.string().valid(...orderStatuses).optional(),
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional(),
  }),
};

const updateOrderStatus = {
  params: Joi.object().keys({
    orderId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid(...orderStatuses).required(),
  }),
};

const verifyDeliveryOtp = {
  params: Joi.object().keys({
    orderId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    otp: Joi.string().length(4).required(),
  }),
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  verifyDeliveryOtp,
};
