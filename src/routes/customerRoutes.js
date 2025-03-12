const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.post('/', customerController.createCustomer);
router.get('/:id', customerController.getCustomer);
router.post('/:id/transactions', customerController.addTransaction);
router.post('/:id/redeem', customerController.redeemReward);

module.exports = router;