const Joi = require('joi');
const { password } = require('./custom.validation');

const checkPhone = {
  body: Joi.object().keys({
    phone: Joi.string().required(),
  }),
};

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email(),
    phone: Joi.string(),
    password: Joi.string().required().custom(password),
    role: Joi.string().valid('customer', 'dukandar', 'user', 'admin'),
    shopName: Joi.string().allow(''),
  }),
};

const login = {
  body: Joi.object()
    .keys({
      email: Joi.string(),
      phone: Joi.string(),
      password: Joi.string().required(),
    })
    .or('email', 'phone'),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = {
  checkPhone,
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
