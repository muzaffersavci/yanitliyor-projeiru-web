const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/reviewController');
const protect = require('../middleware/auth');

router.get('/', protect, getDashboard);

module.exports = router;
