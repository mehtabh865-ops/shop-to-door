const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { shopService } = require('../services');

const getNearbyShops = catchAsync(async (req, res) => {
  const { lng, lat } = req.query;
  const shops = await shopService.getNearbyShops(lng, lat);
  res.send(shops);
});

const getShopById = catchAsync(async (req, res) => {
  const shop = await shopService.getShopById(req.params.shopId);
  res.send(shop);
});

const getMyShop = catchAsync(async (req, res) => {
  const shop = await shopService.ensureShopForDukandar(req.user);
  res.send(shop);
});

const updateMyShop = catchAsync(async (req, res) => {
  let shop = await shopService.ensureShopForDukandar(req.user);
  shop = await shopService.updateShop(shop._id, req.body, req.user._id || req.user.id);
  res.send(shop);
});

module.exports = {
  getNearbyShops,
  getShopById,
  getMyShop,
  updateMyShop,
};
