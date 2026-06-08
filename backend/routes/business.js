const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const protect = require('../middleware/auth');

router.use(protect);

router.get('/', businessController.getBusiness);
router.put('/', businessController.updateBusiness);
router.post('/fetch-reviews', businessController.fetchReviews);

module.exports = router;
