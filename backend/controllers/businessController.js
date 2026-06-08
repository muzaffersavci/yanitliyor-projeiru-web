const Business = require('../models/Business');

// GET /api/business
exports.getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) return res.status(404).json({ message: 'İşletme bulunamadı.' });
    res.json(business);
  } catch (err) {
    next(err);
  }
};

// PUT /api/business
exports.updateBusiness = async (req, res, next) => {
  try {
    const { name, sector, activeTone } = req.body;
    const business = await Business.findOneAndUpdate(
      { owner: req.user._id },
      { name, sector, activeTone },
      { new: true, runValidators: true }
    );
    if (!business) return res.status(404).json({ message: 'İşletme bulunamadı.' });
    res.json(business);
  } catch (err) {
    next(err);
  }
};

// POST /api/business/fetch-reviews (stub - Google Maps API olmadan çalışmaz)
exports.fetchReviews = async (req, res) => {
  res.json({ status: 'success', msg: 'Bu özellik için Google Maps API bağlantısı gereklidir.' });
};
