const httpStatus = require('http-status');
const { Order, Shop, Product } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Place a new hyperlocal order (Customer action)
 * @param {ObjectId} customerId
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const createOrder = async (customerId, orderBody) => {
  const { shopId, items, deliveryAddress, paymentMethod } = orderBody;

  // 1. Verify Shop exists and is open
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Selected shop not found');
  }
  if (!shop.isOpen) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This shop is currently closed. Please order from an open shop.');
  }

  // 2. Validate items & calculate totals
  let calculatedTotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = await Product.findOne({ _id: item.productId, shop: shopId });
    if (!product) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Product not found or does not belong to this shop: ${item.productId}`);
    }
    if (!product.isAvailable || product.stock < item.quantity) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Product ${product.name} is currently out of stock`);
    }

    const itemTotal = product.price * item.quantity;
    calculatedTotal += itemTotal;

    verifiedItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      unit: product.unit,
      totalPrice: itemTotal,
    });
  }

  if (shop.minimumOrder && calculatedTotal < shop.minimumOrder) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Minimum order amount for this shop is Rs. ${shop.minimumOrder}`);
  }

  // 3. Generate unique order number
  const orderNumber = `STD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const order = await Order.create({
    orderNumber,
    customer: customerId,
    shop: shop._id,
    items: verifiedItems,
    totalAmount: calculatedTotal,
    deliveryAddress,
    paymentMethod: paymentMethod || 'cod',
    status: 'placed',
  });

  return order;
};

/**
 * Get customer's orders (Strictly filtered by logged-in customer)
 * @param {ObjectId} customerId
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getCustomerOrders = async (customerId, filter = {}, options = {}) => {
  const finalFilter = { ...filter, customer: customerId };
  return Order.paginate(finalFilter, {
    ...options,
    populate: 'shop',
    sortBy: options.sortBy || 'createdAt:desc',
  });
};

/**
 * Get Dukandar's shop orders (Strictly filtered by Dukandar's shop)
 * @param {ObjectId} ownerId
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getShopOrders = async (ownerId, filter = {}, options = {}) => {
  const shop = await Shop.findOne({ owner: ownerId });
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop profile not found');
  }

  const finalFilter = { ...filter, shop: shop._id };
  return Order.paginate(finalFilter, {
    ...options,
    populate: 'customer',
    sortBy: options.sortBy || 'createdAt:desc',
  });
};

/**
 * Update order status (Dukandar action, strictly isolated to their own shop)
 * @param {ObjectId} ownerId
 * @param {ObjectId} orderId
 * @param {string} newStatus
 * @returns {Promise<Order>}
 */
const updateOrderStatus = async (ownerId, orderId, newStatus) => {
  const shop = await Shop.findOne({ owner: ownerId });
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop profile not found');
  }

  const order = await Order.findOne({ _id: orderId, shop: shop._id });
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found for your shop');
  }

  order.status = newStatus;
  if (newStatus === 'delivered') {
    order.paymentStatus = 'paid';
  }
  await order.save();
  return order;
};

/**
 * Verify customer OTP on delivery
 * @param {ObjectId} ownerId
 * @param {ObjectId} orderId
 * @param {string} otp
 * @returns {Promise<Order>}
 */
const verifyDeliveryOtp = async (ownerId, orderId, otp) => {
  const shop = await Shop.findOne({ owner: ownerId });
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop profile not found');
  }

  const order = await Order.findOne({ _id: orderId, shop: shop._id });
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found for your shop');
  }

  if (order.deliveryOtp !== otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid delivery OTP');
  }

  order.status = 'delivered';
  order.paymentStatus = 'paid';
  await order.save();
  return order;
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getShopOrders,
  updateOrderStatus,
  verifyDeliveryOtp,
};
