const User = require('../models/User');
const Business = require('../models/Business');

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bu işlem için admin yetkisi gereklidir.' });
  }
  next();
};

// GET /api/admin/users
exports.getUsers = [
  requireAdmin,
  async (req, res, next) => {
    try {
      const users = await User.find().populate('business');
      const result = users.map((u) => {
        const b = u.business;
        const daysLeft = b && b.membershipEnd
          ? Math.max(0, Math.ceil((new Date(b.membershipEnd) - Date.now()) / (1000 * 60 * 60 * 24)))
          : 0;
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          is_active: u.isActive,
          is_admin: u.role === 'admin',
          business_name: b ? b.name : null,
          has_gmb: false,
          membership_tier: b ? b.membershipTier : 0,
          package_name: b ? b.packageName : 'Deneme',
          quota_used: b ? b.currentUsage : 0,
          quota_limit: b ? b.monthlyQuota : 0,
          days_left: daysLeft,
        };
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
];

// POST /api/admin/toggle-user/:id
exports.toggleUser = [
  requireAdmin,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      if (user._id.equals(req.user._id)) {
        return res.status(400).json({ message: 'Kendinizi engelleyemezsiniz.' });
      }
      user.isActive = !user.isActive;
      await user.save({ validateBeforeSave: false });
      res.json({ ok: true, isActive: user.isActive });
    } catch (err) {
      next(err);
    }
  },
];
