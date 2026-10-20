const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { comboValidation } = require('../../validations');
const { comboController } = require('../../controllers');

const router = express.Router();

// Dukandar: Create new combo pack
router
  .route('/')
  .post(auth('manageProducts'), validate(comboValidation.createCombo), comboController.createCombo);

// Dukandar: Get own combos
router
  .route('/my')
  .get(auth('manageProducts'), comboController.getMyCombos);

// Customer: Browse combos of a specific shop
router
  .route('/shop/:shopId')
  .get(validate(comboValidation.getShopCombos), comboController.getShopCombos);

// Dukandar: Update or Delete combo
router
  .route('/:comboId')
  .patch(auth('manageProducts'), validate(comboValidation.updateCombo), comboController.updateCombo)
  .delete(auth('manageProducts'), validate(comboValidation.deleteCombo), comboController.deleteCombo);

module.exports = router;
