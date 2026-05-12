const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/my', inventoryController.getMyInventory);
router.get('/:entityId', inventoryController.getInventory);
router.put('/:entityId', inventoryController.updateInventory);

module.exports = router;
