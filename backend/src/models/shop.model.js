const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const shopSchema = mongoose.Schema(
  {
    ownerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      index: true,
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    shopName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [77.209, 28.6139],
      },
    },
    deliveryRadiusKm: {
      type: Number,
      default: 3.5, // e.g. 3.5 km circular operating radius
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

shopSchema.plugin(toJSON);
shopSchema.plugin(paginate);

// 2dsphere index for Geo-Radius discovery
shopSchema.index({ location: '2dsphere' });

shopSchema.pre('save', function (next) {
  if (!this.shopName && this.name) this.shopName = this.name;
  if (!this.name && this.shopName) this.name = this.shopName;
  if (!this.ownerId && this.owner) this.ownerId = this.owner;
  if (!this.owner && this.ownerId) this.owner = this.ownerId;
  next();
});

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
