const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');

// Stub yanıtlar — Google Maps API olmadan çalışmaz, sınav için örnek veri döner
router.post('/search', protect, (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ message: 'Arama terimi zorunludur.' });

  // Demo verisi
  res.json({
    results: [
      { place_id: 'demo_1', name: `${query} - Demo Sonuç 1`, rating: 4.2, address: 'Demo Adres, İstanbul' },
      { place_id: 'demo_2', name: `${query} - Demo Sonuç 2`, rating: 3.8, address: 'Demo Adres, Ankara' },
    ],
  });
});

router.post('/analyze', protect, (req, res) => {
  const { name } = req.body;

  res.json({
    strengths: [
      'Yüksek müşteri memnuniyeti yorumları',
      'Hızlı teslimat ve servis',
      'Geniş ürün yelpazesi',
    ],
    weaknesses: [
      'Fiyatlandırma politikası şikayetleri',
      'Personel tutumu konusunda olumsuz yorumlar',
      'Uzun bekleme süreleri',
    ],
    strategy_advice: `${name || 'Rakibiniz'} hakkındaki bu analiz demo verisidir. Gerçek analiz için Google Maps API bağlantısı gereklidir. Ancak genel strateji: rakibin zayıf noktası olan personel tutumu ve fiyatlandırma konularında kendinizi konumlandırın.`,
  });
});

module.exports = router;
