const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const shopRoute = require('./shop.route');
const productRoute = require('./product.route');
const orderRoute = require('./order.route');
const comboRoute = require('./combo.route');
const couponRoute = require('./coupon.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/shops',
    route: shopRoute,
  },
  {
    path: '/products',
    route: productRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
  {
    path: '/combos',
    route: comboRoute,
  },
  {
    path: '/coupons',
    route: couponRoute,
  },
];

const devRoutes = [
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
