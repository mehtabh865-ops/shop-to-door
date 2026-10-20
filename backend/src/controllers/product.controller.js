const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');

const getProducts = catchAsync(async (req, res) => {
  const { shopId, category } = req.query;
  const products = await productService.getProductsByShopId(shopId, category);
  res.send(products);
});

const getMyProducts = catchAsync(async (req, res) => {
  const products = await productService.getMyProducts(req.user);
  res.send(products);
});

const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.user, req.body);
  res.status(httpStatus.CREATED).send(product);
});

const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(req.user, req.params.productId, req.body);
  res.send(product);
});

const deleteProduct = catchAsync(async (req, res) => {
  const product = await productService.deleteProduct(req.user, req.params.productId);
  res.send(product);
});

module.exports = {
  getProducts,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
