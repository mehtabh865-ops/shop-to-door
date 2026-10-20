const httpStatus = require('http-status');
const { Order, Shop } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Place a new order (Customer action)
 */
const createOrder = async (user, orderBody) => {
  if (!orderBody.shopId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Shop ID is required to place an order');
  }

  const shop = await Shop.findById(orderBody.shopId);
  if (!shop || !shop.isOpen) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This shop is currently not accepting orders');
  }

  // Generate random 4-digit secure delivery OTP
  const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const orderNumber = 'STD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

  const order = await Order.create({
    orderNumber,
    customerId: user._id || user.id,
    customer: user._id || user.id,
    customerName: user.name || 'Customer',
    customerPhone: user.phone || orderBody.customerPhone || '',
    shopId: shop._id,
    shop: shop._id,
    items: orderBody.items || [],
    totalAmount: orderBody.totalAmount,
    deliveryOtp,
    status: 'pending',
    deliveryAddress: orderBody.deliveryAddress || 'Customer Doorstep',
  });

  return order;
};

/**
 * Get customer orders (Customer sees their own orders across all shops)
 */
const getCustomerOrders = async (user) => {
  const userId = user._id || user.id;
  return Order.find({
    $or: [{ customerId: userId }, { customer: userId }],
  })
    .populate('shopId', 'shopName address phone')
    .sort({ createdAt: -1 });
};

/**
 * Get dukandar orders (Strict isolation: Dukandar sees ONLY their shop's orders)
 */
const getDukandarOrders = async (user) => {
  const shop = await Shop.findOne({
    $or: [{ ownerId: user._id || user.id }, { owner: user._id || user.id }],
  });
  if (!shop) {
    return [];
  }

  return Order.find({
    $or: [{ shopId: shop._id }, { shop: shop._id }],
  }).sort({ createdAt: -1 });
};

/**
 * Update order status by dukandar
 */
const updateOrderStatus = async (user, orderId, status) => {
  const shop = await Shop.findOne({
    $or: [{ ownerId: user._id || user.id }, { owner: user._id || user.id }],
  });
  if (!shop) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: Shop not found');
  }

  const order = await Order.findOne({
    _id: orderId,
    $or: [{ shopId: shop._id }, { shop: shop._id }],
  });
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  order.status = status;
  await order.save();
  return order;
};

/**
 * Verify delivery OTP at doorstep (Strict Dukandar action)
 */
const verifyDeliveryOtp = async (user, orderId, inputOtp) => {
  const shop = await Shop.findOne({
    $or: [{ ownerId: user._id || user.id }, { owner: user._id || user.id }],
  });
  if (!shop) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: Shop not found');
  }

  const order = await Order.findOne({
    _id: orderId,
    $or: [{ shopId: shop._id }, { shop: shop._id }],
  });
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  if (order.deliveryOtp !== inputOtp.toString().trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Galat OTP! Kripya customer se sahi 4-digit OTP lein.');
  }

  order.status = 'delivered';
  await order.save();
  return order;
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getDukandarOrders,
  updateOrderStatus,
  verifyDeliveryOtp,
};
