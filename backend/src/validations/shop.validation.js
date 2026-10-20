const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { shopCategories } = require('../models/shop.model');

const createOrUpdateShop = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    category: Joi.string().valid(...shopCategories).default('general'),
    description: Joi.string().allow('').optional(),
    image: Joi.string().allow('').optional(),
    phone: Joi.string().allow('').optional(),
    address: Joi.object().keys({
      street: Joi.string().allow('').optional(),
      landmark: Joi.string().allow('').optional(),
      city: Joi.string().allow('').optional(),
      state: Joi.string().allow('').optional(),
      pincode: Joi.string().allow('').optional(),
      coordinates: Joi.object().keys({
        lat: Joi.number().optional(),
        lng: Joi.number().optional(),
      }).optional(),
    }).optional(),
    deliveryRadiusKm: Joi.number().optional(),
    minimumOrder: Joi.number().optional(),
  }),
};

const getShop = {
  params: Joi.object().keys({
    shopId: Joi.string().custom(objectId),
  }),
};

const getShops = {
  query: Joi.object().keys({
    category: Joi.string().optional(),
    isOpen: Joi.boolean().optional(),
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional(),
  }),
};

module.exports = {
  createOrUpdateShop,
  getShop,
  getShops,
};
