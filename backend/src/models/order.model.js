const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const orderItemSchema = mongoose.Schema({
  productId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Product',
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unit: {
    type: String,
    default: '1 unit',
  },
});

const orderSchema = mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      index: true,
    },
    customer: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      index: true,
    },
    customerName: {
      type: String,
      default: '',
    },
    customerPhone: {
      type: String,
      default: '',
    },
    shopId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Shop',
      index: true,
    },
    shop: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Shop',
      index: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryOtp: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveryAddress: {
      type: String,
      default: 'Customer Doorstep',
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

// Compound indexing for sub-millisecond retrieval by customer or shop
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ shopId: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
