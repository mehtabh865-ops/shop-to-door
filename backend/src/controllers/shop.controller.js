const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { shopService } = require('../services');

const createOrUpdateShop = catchAsync(async (req, res) => {
  const shop = await shopService.createOrUpdateShop(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(shop);
});

const getMyShop = catchAsync(async (req, res) => {
  const shop = await shopService.getShopByOwner(req.user.id);
  res.send(shop);
});

const getShop = catchAsync(async (req, res) => {
  const shop = await shopService.getShopById(req.params.shopId);
  res.send(shop);
});

const getShops = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['category', 'isOpen']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await shopService.queryShops(filter, options);
  res.send(result);
});

const toggleShopStatus = catchAsync(async (req, res) => {
  const shop = await shopService.toggleShopStatus(req.user.id);
  res.send(shop);
});

module.exports = {
  createOrUpdateShop,
  getMyShop,
  getShop,
  getShops,
  toggleShopStatus,
};
