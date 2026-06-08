const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, businessName, sector } = req.body;

    if (!name || !email || !password || !businessName) {
      return res.status(400).json({ message: 'Ad, e-posta, şifre ve işletme adı zorunludur.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Bu e-posta zaten kullanımda.' });

    const user = await User.create({ name, email, password });

    const business = await Business.create({
      name: businessName,
      sector: sector || 'Genel',
      owner: user._id,
    });

    user.business = business._id;
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.status(201).json({
      status: 'success',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      business: { id: business._id, name: business.name },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-posta ve şifre zorunludur.' });
    }

    const user = await User.findOne({ email }).populate('business');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Hesabınız engellenmiştir.' });
    }

    const token = signToken(user._id);
    res.json({
      status: 'success',
      token,
      name: user.name,
      is_admin: user.role === 'admin',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: req.user, business: req.user.business });
};

// POST /api/auth/setup (işletme bilgilerini güncelle)
exports.setup = async (req, res, next) => {
  try {
    const { business_name, sector, kvkk_accepted } = req.body;

    if (!kvkk_accepted) {
      return res.status(400).json({ message: 'Hizmet şartlarını onaylamalısınız.' });
    }

    let business = await Business.findOne({ owner: req.user._id });

    if (business) {
      if (business_name) business.name = business_name;
      if (sector) business.sector = sector;
      await business.save();
    } else {
      business = await Business.create({
        name: business_name || 'İşletmem',
        sector: sector || 'Genel',
        owner: req.user._id,
      });
      req.user.business = business._id;
      await req.user.save({ validateBeforeSave: false });
    }

    res.json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/google-login (stub)
exports.googleLogin = async (req, res) => {
  res.status(501).json({ message: 'Google girişi bu sürümde desteklenmiyor. E-posta ile giriş yapın.' });
};

// POST /api/auth/fetch-my-businesses (stub)
exports.fetchMyBusinesses = async (req, res) => {
  res.json({ locations: [] });
};
