const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const shopCategories = [
  'grocery',
  'dairy',
  'fruits_vegetables',
  'pharmacy',
  'fashion',
  'electronics',
  'bakery',
  'restaurant',
  'hardware',
  'general',
];

const shopSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: shopCategories,
      default: 'general',
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      landmark: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    isOpen: {
      type: Boolean,
      default: true,
      index: true,
    },
    deliveryRadiusKm: {
      type: Number,
      default: 5,
    },
    minimumOrder: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
  },
  {
    timestamps: true,
  }
);

shopSchema.plugin(toJSON);
shopSchema.plugin(paginate);

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
module.exports.shopCategories = shopCategories;
