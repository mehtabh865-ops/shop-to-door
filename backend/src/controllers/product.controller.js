const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { productService } = require('../services');

const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(product);
});

const getMyProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['category', 'isAvailable']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productService.getMyProducts(req.user.id, filter, options);
  res.send(result);
});

const getShopProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['category', 'isAvailable']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productService.getShopProducts(req.params.shopId, filter, options);
  res.send(result);
});

const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.productId);
  res.send(product);
});

const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(req.user.id, req.params.productId, req.body);
  res.send(product);
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.user.id, req.params.productId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createProduct,
  getMyProducts,
  getShopProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
