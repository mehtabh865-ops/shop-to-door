const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const couponSchema = mongoose.Schema(
  {
    shopId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    maxDiscount: {
      type: Number,
      default: 100,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.plugin(toJSON);
couponSchema.plugin(paginate);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
