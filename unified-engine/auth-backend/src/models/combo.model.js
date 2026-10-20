const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const comboSchema = mongoose.Schema(
  {
    shopId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    items: [
      {
        type: String,
        trim: true,
      },
    ],
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    offerPrice: {
      type: Number,
      required: true,
      min: 0,
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

comboSchema.plugin(toJSON);
comboSchema.plugin(paginate);

const Combo = mongoose.model('Combo', comboSchema);

module.exports = Combo;
