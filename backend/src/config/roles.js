const allRoles = {
  user: [],
  customer: [],
  dukandar: ['manageShop', 'manageProducts', 'manageOrders'],
  admin: ['getUsers', 'manageUsers'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
