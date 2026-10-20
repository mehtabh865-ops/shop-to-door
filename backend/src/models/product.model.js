const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const productUnits = [
  'kg',
  'gm',
  'liter',
  'ml',
  'piece',
  'packet',
  'box',
  'strip',
  'meter',
  'pair',
  'unit',
];

const productSchema = mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: {
      type: Number,
      min: 0,
      default: 0,
    },
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
    unit: {
      type: String,
      enum: productUnits,
      default: 'piece',
    },
    unitValue: {
      type: String,
      default: '1',
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isOffer: {
      type: Boolean,
      default: false,
    },
    offerBadge: {
      type: String,
      default: '',
      trim: true,
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

productSchema.plugin(toJSON);
productSchema.plugin(paginate);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
module.exports.productUnits = productUnits;
