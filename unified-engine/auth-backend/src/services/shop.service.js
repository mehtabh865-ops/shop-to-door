const httpStatus = require('http-status');
const { Shop } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a shop for dukandar
 */
const createShop = async (ownerId, shopBody) => {
  const existingShop = await Shop.findOne({ ownerId });
  if (existingShop) {
    Object.assign(existingShop, shopBody);
    return existingShop.save();
  }
  return Shop.create({
    ownerId,
    shopName: shopBody.shopName || 'Apni Dukan',
    description: shopBody.description || 'Fresh grocery & essentials at your doorstep',
    phone: shopBody.phone,
    address: shopBody.address || 'Local Market Area',
    location: shopBody.location || { type: 'Point', coordinates: [77.209, 28.6139] },
    deliveryRadiusKm: shopBody.deliveryRadiusKm || 3.5,
    isOpen: shopBody.isOpen !== undefined ? shopBody.isOpen : true,
  });
};

/**
 * Get shop by owner ID
 */
const getShopByOwner = async (ownerId) => {
  return Shop.findOne({ ownerId });
};

/**
 * Ensure shop exists for dukandar
 */
const ensureShopForDukandar = async (user) => {
  let shop = await Shop.findOne({ ownerId: user._id || user.id });
  if (!shop) {
    shop = await Shop.create({
      ownerId: user._id || user.id,
      shopName: user.name ? `${user.name} General Store` : 'Apni Dukan',
      description: 'Fresh grocery & essentials delivered in 15 mins',
      phone: user.phone || '9876543210',
      address: 'Main Market, City Center',
      location: { type: 'Point', coordinates: [77.209, 28.6139] },
      deliveryRadiusKm: 5.0,
      isOpen: true,
    });
  }
  return shop;
};

/**
 * Get shop by ID
 */
const getShopById = async (id) => {
  const shop = await Shop.findById(id);
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
  }
  return shop;
};

/**
 * Update shop by ID
 */
const updateShop = async (shopId, updateBody, ownerId) => {
  const shop = await getShopById(shopId);
  if (ownerId && shop.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: You do not own this shop');
  }
  Object.assign(shop, updateBody);
  await shop.save();
  return shop;
};

/**
 * Geo-Radius Discovery Formula:
 * Find shops whose deliveryRadiusKm circle covers the customer's coordinates.
 */
const getNearbyShops = async (lng, lat) => {
  try {
    if (lng !== undefined && lat !== undefined && !isNaN(parseFloat(lng)) && !isNaN(parseFloat(lat))) {
      const longitude = parseFloat(lng);
      const latitude = parseFloat(lat);

      const shops = await Shop.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [longitude, latitude] },
            distanceField: 'distanceMeters',
            spherical: true,
          },
        },
        {
          $match: {
            isOpen: true,
            $expr: {
              $lte: ['$distanceMeters', { $multiply: ['$deliveryRadiusKm', 1000] }],
            },
          },
        },
      ]);

      if (shops.length > 0) {
        return shops;
      }
    }
  } catch (e) {
    // Fallback if geo index not yet built
  }

  // Fallback: return open shops
  return Shop.find({ isOpen: true }).limit(20);
};

module.exports = {
  createShop,
  getShopByOwner,
  ensureShopForDukandar,
  getShopById,
  updateShop,
  getNearbyShops,
};
