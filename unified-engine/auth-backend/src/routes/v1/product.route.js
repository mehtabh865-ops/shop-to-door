const express = require('express');
const auth = require('../../middlewares/auth');
const productController = require('../../controllers/product.controller');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/my-inventory', auth(), productController.getMyProducts);
router.post('/', auth(), productController.createProduct);
router.patch('/:productId', auth(), productController.updateProduct);
router.delete('/:productId', auth(), productController.deleteProduct);

module.exports = router;
