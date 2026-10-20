const httpStatus = require('http-status');
const { Product, Shop } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Add a new product (Strictly scoped to logged in Dukandar)
 * @param {ObjectId} ownerId
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */
const createProduct = async (ownerId, productBody) => {
  const shop = await Shop.findOne({ owner: ownerId });
  if (!shop) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please create your shop profile before adding products');
  }

  const product = await Product.create({
    ...productBody,
    shop: shop._id,
    owner: ownerId,
  });
  return product;
};

/**
 * Get products for a specific shop (Customer View)
 * @param {ObjectId} shopId
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getShopProducts = async (shopId, filter = {}, options = {}) => {
  const finalFilter = { ...filter, shop: shopId };
  return Product.paginate(finalFilter, options);
};

/**
 * Get products belonging to the logged in Dukandar (Multi-Tenant Isolation)
 * @param {ObjectId} ownerId
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getMyProducts = async (ownerId, filter = {}, options = {}) => {
  const finalFilter = { ...filter, owner: ownerId };
  return Product.paginate(finalFilter, options);
};

/**
 * Get single product by ID
 * @param {ObjectId} productId
 * @returns {Promise<Product>}
 */
const getProductById = async (productId) => {
  const product = await Product.findById(productId).populate('shop', 'name isOpen');
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product;
};

/**
 * Update product (Ensures ONLY the owner can update their own product)
 * @param {ObjectId} ownerId
 * @param {ObjectId} productId
 * @param {Object} updateBody
 * @returns {Promise<Product>}
 */
const updateProduct = async (ownerId, productId, updateBody) => {
  const product = await Product.findOne({ _id: productId, owner: ownerId });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found or you do not have permission to edit it');
  }
  Object.assign(product, updateBody);
  await product.save();
  return product;
};

/**
 * Delete product (Ensures ONLY the owner can delete their own product)
 * @param {ObjectId} ownerId
 * @param {ObjectId} productId
 * @returns {Promise<Product>}
 */
const deleteProduct = async (ownerId, productId) => {
  const product = await Product.findOne({ _id: productId, owner: ownerId });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found or you do not have permission to delete it');
  }
  await product.deleteOne();
  return product;
};

module.exports = {
  createProduct,
  getShopProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
