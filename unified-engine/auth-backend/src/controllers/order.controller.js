const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { orderService } = require('../services');

const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.user, req.body);
  res.status(httpStatus.CREATED).send(order);
});

const getMyOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getCustomerOrders(req.user);
  res.send(orders);
});

const getDukandarOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getDukandarOrders(req.user);
  res.send(orders);
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.user, req.params.orderId, req.body.status);
  res.send(order);
});

const verifyOtp = catchAsync(async (req, res) => {
  const order = await orderService.verifyDeliveryOtp(req.user, req.params.orderId, req.body.otp);
  res.send({ message: 'Delivery OTP verified successfully! Order delivered.', order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getDukandarOrders,
  updateOrderStatus,
  verifyOtp,
};
