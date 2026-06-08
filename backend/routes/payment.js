const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const Business = require('../models/Business');

// POST /api/payment/subscribe
router.post('/subscribe', protect, async (req, res, next) => {
  try {
    const { package_type, duration_months } = req.body;
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) return res.status(404).json({ message: 'İşletme bulunamadı.' });

    const now = new Date();
    const currentEnd = business.membershipEnd && business.membershipEnd > now ? business.membershipEnd : now;
    const durationMs = (duration_months || 1) * 30 * 24 * 60 * 60 * 1000;

    if (package_type === 1) {
      business.packageName = 'Esnaf Paketi';
      business.monthlyQuota = 50;
      business.membershipTier = 1;
    } else if (package_type === 2) {
      business.packageName = 'Usta Paketi';
      business.monthlyQuota = 500;
      business.membershipTier = 2;
    }

    business.membershipEnd = new Date(currentEnd.getTime() + durationMs);
    business.currentUsage = 0;
    await business.save();

    res.json({ status: 'success' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
