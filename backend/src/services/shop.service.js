const httpStatus = require('http-status');
const { Shop, User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create or update shop profile for a dukandar
 * @param {ObjectId} ownerId
 * @param {Object} shopBody
 * @returns {Promise<Shop>}
 */
const createOrUpdateShop = async (ownerId, shopBody) => {
  let shop = await Shop.findOne({ owner: ownerId });
  if (shop) {
    Object.assign(shop, shopBody);
    await shop.save();
    return shop;
  }
  shop = await Shop.create({ ...shopBody, owner: ownerId });
  return shop;
};

/**
 * Get shop by owner ID (Dukandar)
 * @param {ObjectId} ownerId
 * @returns {Promise<Shop>}
 */
const getShopByOwner = async (ownerId) => {
  let shop = await Shop.findOne({ owner: ownerId });
  if (!shop) {
    const user = await User.findById(ownerId);
    if (user && user.role === 'dukandar') {
      shop = await Shop.create({
        name: user.shopName || `${user.name}'s Shop`,
        owner: ownerId,
        category: 'grocery',
        phone: user.phoneNumber || '9876543210',
        description: 'Local neighborhood store with fast doorstep delivery',
        isOpen: true,
        deliveryRadiusKm: 5,
      });
      return shop;
    }
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop profile not found for this user');
  }
  return shop;
};

/**
 * Get shop by ID (Public / Customer)
 * @param {ObjectId} id
 * @returns {Promise<Shop>}
 */
const getShopById = async (id) => {
  const shop = await Shop.findById(id).populate('owner', 'name phoneNumber');
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
  }
  return shop;
};

/**
 * Query shops (for customers to browse nearby / active shops)
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const queryShops = async (filter, options) => {
  return Shop.paginate(filter, options);
};

/**
 * Toggle shop open / closed status
 * @param {ObjectId} ownerId
 * @returns {Promise<Shop>}
 */
const toggleShopStatus = async (ownerId) => {
  const shop = await getShopByOwner(ownerId);
  shop.isOpen = !shop.isOpen;
  await shop.save();
  return shop;
};

module.exports = {
  createOrUpdateShop,
  getShopByOwner,
  getShopById,
  queryShops,
  toggleShopStatus,
};
