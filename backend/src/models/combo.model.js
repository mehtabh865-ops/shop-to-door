const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const comboItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false }
);

const comboSchema = mongoose.Schema(
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
    image: {
      type: String,
      default: '',
    },
    items: {
      type: [comboItemSchema],
      required: true,
      validate(v) {
        if (!v || v.length < 2) {
          throw new Error('A combo pack must contain at least 2 products');
        }
      },
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    comboPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    savings: {
      type: Number,
      default: 0,
      min: 0,
    },
    badge: {
      type: String,
      default: 'SUPER SAVER',
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

comboSchema.plugin(toJSON);
comboSchema.plugin(paginate);

const Combo = mongoose.model('Combo', comboSchema);

module.exports = Combo;
