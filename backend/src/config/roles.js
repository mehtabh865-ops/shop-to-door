const allRoles = {
  customer: ['getShops', 'createOrder', 'getOrders'],
  dukandar: ['manageInventory', 'manageCombos', 'manageCoupons', 'manageOrders', 'getShops'],
  user: ['getShops', 'createOrder', 'getOrders'],
  admin: ['getUsers', 'manageUsers', 'manageInventory', 'manageCombos', 'manageCoupons', 'manageOrders', 'getShops'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
