const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const couponSchema = mongoose.Schema(
  {
    shop: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'flat',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiryDate: {
      type: Date,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    usageLimit: {
      type: Number,
      default: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique coupon code per shop
couponSchema.index({ shop: 1, code: 1 }, { unique: true });

couponSchema.plugin(toJSON);
couponSchema.plugin(paginate);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
