const httpStatus = require('http-status');
const { Combo, Shop, Product } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new Combo Pack (Dukandar action)
 * @param {ObjectId} ownerId
 * @param {Object} comboBody
 * @returns {Promise<Combo>}
 */
const createCombo = async (ownerId, comboBody) => {
  const shop = await Shop.findOne({ owner: ownerId });
  if (!shop) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please create your shop profile first');
  }

  // Calculate original price by summing up the individual products
  let originalPrice = 0;
  for (const item of comboBody.items) {
    const prod = await Product.findOne({ _id: item.product, shop: shop._id });
    if (!prod) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Product not found in your inventory: ${item.product}`);
    }
    originalPrice += prod.price * (item.quantity || 1);
  }

  const comboPrice = comboBody.comboPrice;
  if (comboPrice >= originalPrice) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Combo price must be less than the total original price');
  }

  const savings = originalPrice - comboPrice;

  const combo = await Combo.create({
    ...comboBody,
    shop: shop._id,
    owner: ownerId,
    originalPrice,
    comboPrice,
    savings,
  });

  return combo;
};

/**
 * Get Combos belonging to the logged-in Dukandar
 * @param {ObjectId} ownerId
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getMyCombos = async (ownerId, filter = {}, options = {}) => {
  const finalFilter = { ...filter, owner: ownerId };
  return Combo.paginate(finalFilter, {
    ...options,
    populate: 'items.product',
  });
};

/**
 * Get Combos for a specific shop (Customer View)
 * @param {ObjectId} shopId
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getShopCombos = async (shopId, filter = {}, options = {}) => {
  const finalFilter = { ...filter, shop: shopId, isAvailable: true };
  return Combo.paginate(finalFilter, {
    ...options,
    populate: 'items.product',
  });
};

/**
 * Update combo (Strictly isolated to owner)
 * @param {ObjectId} ownerId
 * @param {ObjectId} comboId
 * @param {Object} updateBody
 * @returns {Promise<Combo>}
 */
const updateCombo = async (ownerId, comboId, updateBody) => {
  const combo = await Combo.findOne({ _id: comboId, owner: ownerId });
  if (!combo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Combo not found or permission denied');
  }

  if (updateBody.comboPrice) {
    combo.comboPrice = updateBody.comboPrice;
    combo.savings = Math.max(0, combo.originalPrice - updateBody.comboPrice);
  }

  Object.assign(combo, updateBody);
  await combo.save();
  return combo;
};

/**
 * Delete combo
 * @param {ObjectId} ownerId
 * @param {ObjectId} comboId
 * @returns {Promise<Combo>}
 */
const deleteCombo = async (ownerId, comboId) => {
  const combo = await Combo.findOne({ _id: comboId, owner: ownerId });
  if (!combo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Combo not found or permission denied');
  }
  await combo.deleteOne();
  return combo;
};

module.exports = {
  createCombo,
  getMyCombos,
  getShopCombos,
  updateCombo,
  deleteCombo,
};
