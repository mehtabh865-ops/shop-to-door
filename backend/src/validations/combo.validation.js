const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCombo = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    image: Joi.string().allow('').optional(),
    items: Joi.array()
      .items(
        Joi.object().keys({
          product: Joi.string().required().custom(objectId),
          quantity: Joi.number().integer().min(1).default(1),
        })
      )
      .min(2)
      .required(),
    comboPrice: Joi.number().required().min(0),
    badge: Joi.string().allow('').optional(),
  }),
};

const getShopCombos = {
  params: Joi.object().keys({
    shopId: Joi.string().required().custom(objectId),
  }),
};

const updateCombo = {
  params: Joi.object().keys({
    comboId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string().allow(''),
      image: Joi.string().allow(''),
      comboPrice: Joi.number().min(0),
      badge: Joi.string().allow(''),
      isAvailable: Joi.boolean(),
    })
    .min(1),
};

const deleteCombo = {
  params: Joi.object().keys({
    comboId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createCombo,
  getShopCombos,
  updateCombo,
  deleteCombo,
};
