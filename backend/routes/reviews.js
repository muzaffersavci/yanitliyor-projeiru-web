const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const protect = require('../middleware/auth');

router.use(protect);

router.get('/', reviewController.getReviews);
router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.post('/:id/action', reviewController.reviewAction);

module.exports = router;
