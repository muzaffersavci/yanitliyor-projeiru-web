const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Oturum açmanız gerekiyor.', detail: 'Token bulunamadı.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('business');

    if (!user) return res.status(401).json({ message: 'Geçersiz token.', detail: 'Kullanıcı bulunamadı.' });
    if (!user.isActive) return res.status(403).json({ message: 'Hesabınız engellenmiştir.' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Geçersiz token.', detail: 'Token doğrulanamadı.' });
  }
};
