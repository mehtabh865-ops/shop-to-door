const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { comboService } = require('../services');

const createCombo = catchAsync(async (req, res) => {
  const combo = await comboService.createCombo(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(combo);
});

const getMyCombos = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['isAvailable']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await comboService.getMyCombos(req.user.id, filter, options);
  res.send(result);
});

const getShopCombos = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['isAvailable']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await comboService.getShopCombos(req.params.shopId, filter, options);
  res.send(result);
});

const updateCombo = catchAsync(async (req, res) => {
  const combo = await comboService.updateCombo(req.user.id, req.params.comboId, req.body);
  res.send(combo);
});

const deleteCombo = catchAsync(async (req, res) => {
  await comboService.deleteCombo(req.user.id, req.params.comboId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createCombo,
  getMyCombos,
  getShopCombos,
  updateCombo,
  deleteCombo,
};
