const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { comboService } = require('../services');

const getCombos = catchAsync(async (req, res) => {
  const { shopId } = req.query;
  const combos = await comboService.getCombosByShopId(shopId);
  res.send(combos);
});

const getMyCombos = catchAsync(async (req, res) => {
  const combos = await comboService.getMyCombos(req.user);
  res.send(combos);
});

const createCombo = catchAsync(async (req, res) => {
  const combo = await comboService.createCombo(req.user, req.body);
  res.status(httpStatus.CREATED).send(combo);
});

const deleteCombo = catchAsync(async (req, res) => {
  const combo = await comboService.deleteCombo(req.user, req.params.comboId);
  res.send(combo);
});

module.exports = {
  getCombos,
  getMyCombos,
  createCombo,
  deleteCombo,
};
