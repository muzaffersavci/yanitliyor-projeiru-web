const express = require('express');
const router = express.Router();
const consultantController = require('../controllers/consultantController');
const protect = require('../middleware/auth');

router.use(protect);

router.post('/chat', consultantController.chat);

module.exports = router;
