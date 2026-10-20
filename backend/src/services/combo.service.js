const httpStatus = require('http-status');
const { Combo, Shop } = require('../models');
const ApiError = require('../utils/ApiError');

const createCombo = async (user, comboBody) => {
  const shop = await Shop.findOne({ ownerId: user._id || user.id });
  if (!shop) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You must have an active shop to create combos');
  }

  return Combo.create({
    shopId: shop._id,
    title: comboBody.title,
    description: comboBody.description || '',
    items: comboBody.items || [],
    originalPrice: comboBody.originalPrice,
    offerPrice: comboBody.offerPrice,
    isActive: comboBody.isActive !== undefined ? comboBody.isActive : true,
  });
};

const getCombosByShopId = async (shopId) => {
  return Combo.find({ shopId, isActive: true }).sort({ createdAt: -1 });
};

const getMyCombos = async (user) => {
  const shop = await Shop.findOne({ ownerId: user._id || user.id });
  if (!shop) return [];
  return Combo.find({ shopId: shop._id }).sort({ createdAt: -1 });
};

const deleteCombo = async (user, comboId) => {
  const shop = await Shop.findOne({ ownerId: user._id || user.id });
  if (!shop) throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: Shop not found');
  const combo = await Combo.findOne({ _id: comboId, shopId: shop._id });
  if (!combo) throw new ApiError(httpStatus.NOT_FOUND, 'Combo not found');
  if (combo.deleteOne) await combo.deleteOne();
  else await combo.remove();
  return combo;
};

module.exports = {
  createCombo,
  getCombosByShopId,
  getMyCombos,
  deleteCombo,
};
