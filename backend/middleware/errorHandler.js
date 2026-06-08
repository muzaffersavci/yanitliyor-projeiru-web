// Merkezi hata yönetimi middleware
module.exports = (err, req, res, next) => {
  console.error('Hata:', err.message);

  // Mongoose validation hatası
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages[0], detail: messages.join(', ') });
  }

  // MongoDB duplicate key hatası
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `Bu ${field} zaten kullanımda.` });
  }

  // JWT hatası
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Geçersiz token.' });
  }

  // Cast hatası (geçersiz ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Geçersiz ID formatı.' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Sunucu hatası oluştu.',
  });
};
