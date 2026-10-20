const express = require('express');
const auth = require('../../middlewares/auth');
const shopController = require('../../controllers/shop.controller');

const router = express.Router();

router.get('/nearby', shopController.getNearbyShops);
router.get('/me', auth(), shopController.getMyShop);
router.patch('/me', auth(), shopController.updateMyShop);
router.get('/:shopId', shopController.getShopById);

module.exports = router;
