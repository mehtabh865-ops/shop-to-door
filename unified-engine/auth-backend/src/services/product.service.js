const httpStatus = require('http-status');
const { Product, Shop } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new product for dukandar's shop
 */
const createProduct = async (user, productBody) => {
  const shop = await Shop.findOne({
    $or: [{ owner: user._id || user.id }, { ownerId: user._id || user.id }],
  });
  if (!shop) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You must have an active shop to add products');
  }

  return Product.create({
    shopId: shop._id,
    shop: shop._id,
    owner: user._id || user.id,
    name: productBody.name,
    category: productBody.category || 'General',
    price: productBody.price,
    mrp: productBody.mrp || productBody.price,
    unit: productBody.unit || '1 unit',
    stock: productBody.stock !== undefined ? productBody.stock : 100,
    isAvailable: productBody.isAvailable !== undefined ? productBody.isAvailable : true,
    imageUrl: productBody.imageUrl || '',
  });
};

/**
 * Get products for a shop (Customer & Dukandar catalog view)
 */
const getProductsByShopId = async (shopId, category) => {
  const filter = {
    $or: [{ shop: shopId }, { shopId: shopId }],
    isAvailable: true,
  };
  if (category && category !== 'All') {
    filter.category = category;
  }
  return Product.find(filter).sort({ createdAt: -1 });
};

/**
 * Get all products for dukandar's own shop (including out-of-stock)
 */
const getMyProducts = async (user) => {
  const shop = await Shop.findOne({
    $or: [{ owner: user._id || user.id }, { ownerId: user._id || user.id }],
  });
  if (!shop) {
    return [];
  }
  return Product.find({
    $or: [{ shop: shop._id }, { shopId: shop._id }],
  }).sort({ createdAt: -1 });
};

/**
 * Update a product (Strictly restricted to shop owner)
 */
const updateProduct = async (user, productId, updateBody) => {
  const shop = await Shop.findOne({ ownerId: user._id || user.id });
  if (!shop) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: Shop not found');
  }

  const product = await Product.findOne({ _id: productId, shopId: shop._id });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found or you do not own it');
  }

  Object.assign(product, updateBody);
  await product.save();
  return product;
};

/**
 * Delete a product (Strictly restricted to shop owner)
 */
const deleteProduct = async (user, productId) => {
  const shop = await Shop.findOne({ ownerId: user._id || user.id });
  if (!shop) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: Shop not found');
  }

  const product = await Product.findOne({ _id: productId, shopId: shop._id });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found or you do not own it');
  }

  if (product.deleteOne) {
    await product.deleteOne();
  } else {
    await product.remove();
  }
  return product;
};

module.exports = {
  createProduct,
  getProductsByShopId,
  getMyProducts,
  updateProduct,
  deleteProduct,
};
