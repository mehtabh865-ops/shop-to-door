const express = require('express');
const auth = require('../../middlewares/auth');
const comboController = require('../../controllers/combo.controller');

const router = express.Router();

router.get('/', comboController.getCombos);
router.get('/my-combos', auth(), comboController.getMyCombos);
router.post('/', auth(), comboController.createCombo);
router.delete('/:comboId', auth(), comboController.deleteCombo);

module.exports = router;
