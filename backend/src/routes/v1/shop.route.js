const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { shopValidation } = require('../../validations');
const { shopController } = require('../../controllers');

const router = express.Router();

// Public routes for customers
router
  .route('/')
  .get(validate(shopValidation.getShops), shopController.getShops)
  .post(auth('manageShop'), validate(shopValidation.createOrUpdateShop), shopController.createOrUpdateShop);

// Dukandar specific routes (Strictly protected by manageShop right)
router.route('/my/profile').get(auth('manageShop'), shopController.getMyShop);
router.route('/my/toggle-status').patch(auth('manageShop'), shopController.toggleShopStatus);

// Single shop public details
router.route('/:shopId').get(validate(shopValidation.getShop), shopController.getShop);

module.exports = router;
