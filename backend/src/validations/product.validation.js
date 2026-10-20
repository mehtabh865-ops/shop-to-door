const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { productUnits } = require('../models/product.model');

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    images: Joi.array().items(Joi.string()).optional(),
    category: Joi.string().required(),
    price: Joi.number().required().min(0),
    mrp: Joi.number().min(0).optional(),
    stock: Joi.number().integer().min(0).optional(),
    unit: Joi.string().valid(...productUnits).default('piece'),
    unitValue: Joi.string().allow('').optional(),
    isAvailable: Joi.boolean().optional(),
    attributes: Joi.object().optional(),
  }),
};

const getShopProducts = {
  params: Joi.object().keys({
    shopId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    category: Joi.string().optional(),
    isAvailable: Joi.boolean().optional(),
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional(),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string().allow(''),
      images: Joi.array().items(Joi.string()),
      category: Joi.string(),
      price: Joi.number().min(0),
      mrp: Joi.number().min(0),
      stock: Joi.number().integer().min(0),
      unit: Joi.string().valid(...productUnits),
      unitValue: Joi.string().allow(''),
      isAvailable: Joi.boolean(),
      attributes: Joi.object(),
    })
    .min(1),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createProduct,
  getShopProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
