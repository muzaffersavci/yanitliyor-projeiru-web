const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const protect = require('../middleware/auth');

router.use(protect);

router.get('/users', adminController.getUsers);
router.post('/toggle-user/:id', adminController.toggleUser);

module.exports = router;
