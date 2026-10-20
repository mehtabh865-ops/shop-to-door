const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { orderService } = require('../services');

const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(order);
});

const getMyOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await orderService.getCustomerOrders(req.user.id, filter, options);
  res.send(result);
});

const getShopOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await orderService.getShopOrders(req.user.id, filter, options);
  res.send(result);
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.user.id, req.params.orderId, req.body.status);
  res.send(order);
});

const verifyDeliveryOtp = catchAsync(async (req, res) => {
  const order = await orderService.verifyDeliveryOtp(req.user.id, req.params.orderId, req.body.otp);
  res.send({ message: 'Delivery verified successfully', order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getShopOrders,
  updateOrderStatus,
  verifyDeliveryOtp,
};
