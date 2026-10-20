const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { productValidation } = require('../../validations');
const { productController } = require('../../controllers');

const router = express.Router();

// Dukandar: Add new product to their own shop
router.route('/').post(auth('manageProducts'), validate(productValidation.createProduct), productController.createProduct);

// Dukandar: View and manage their own product inventory
router.route('/my').get(auth('manageProducts'), productController.getMyProducts);

// Customer: View products belonging to a specific shop
router.route('/shop/:shopId').get(validate(productValidation.getShopProducts), productController.getShopProducts);

// Single product details, update & delete
router
  .route('/:productId')
  .get(validate(productValidation.getProduct), productController.getProduct)
  .patch(auth('manageProducts'), validate(productValidation.updateProduct), productController.updateProduct)
  .delete(auth('manageProducts'), validate(productValidation.deleteProduct), productController.deleteProduct);

module.exports = router;
