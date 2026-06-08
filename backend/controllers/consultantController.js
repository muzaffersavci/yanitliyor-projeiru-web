const Review = require('../models/Review');

// Basit template tabanlı AI danışman yanıtı
function generateConsultantReply(message, businessName, sector, reviews) {
  const msg = message.toLowerCase();
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const negativeCount = reviews.filter((r) => r.rating <= 2).length;

  if (msg.includes('yorum') || msg.includes('değerlend') || msg.includes('müşteri')) {
    return `${businessName} için ${reviews.length} yorum kaydedilmiş. Ortalama puanınız ${avgRating}/5. ${pendingCount} yorum yanıt bekliyor, ${positiveCount} olumlu ve ${negativeCount} olumsuz yorum var. Yanıt oranınızı artırmak müşteri güvenini pekiştirir ve Google sıralamanızı yükseltir.`;
  }

  if (msg.includes('rakip') || msg.includes('kompetitör') || msg.includes('rekabet')) {
    return `${sector} sektöründe rekabetçi olmak için üç temel strateji var: 1) Tüm müşteri yorumlarına 24 saat içinde yanıt verin, 2) Olumsuz yorumları çözüm odaklı yanıtlayın, 3) Memnun müşterileri yorum yazmaya teşvik edin. Bu sayede rakiplerinizden öne geçersiniz.`;
  }

  if (msg.includes('puan') || msg.includes('rating') || msg.includes('yıldız')) {
    if (parseFloat(avgRating) >= 4) {
      return `Mevcut ${avgRating} ortalama puanınız çok iyi! Bu seviyeyi korumak için yanıt oranınızı yüksek tutun. Mutlu müşterilerinizi 5 yıldız vermeye teşvik edin.`;
    }
    return `${avgRating} puanınızı yükseltmek için olumsuz yorumlara hızlı ve özür içeren yanıtlar verin. Sorunları çözdüğünüzü gösterin. 3 ay içinde puanınızın yükseldiğini göreceksiniz.`;
  }

  if (msg.includes('tavsiye') || msg.includes('öneri') || msg.includes('ne yapmalı')) {
    return `${businessName} için ${pendingCount} bekleyen yorum var — önce bunları yanıtlayın. Ardından olumsuz yorumları inceleyin ve tekrar eden şikayetleri operasyonel iyileştirme fırsatı olarak değerlendirin. Son olarak, memnun müşterilerinizi Google Maps'te yorum yazmaya davet edin.`;
  }

  // Genel yanıt
  const generalReplies = [
    `${businessName} adına size yardımcı olabilirim. ${reviews.length} yorumu inceledim — yanıtsız ${pendingCount} yorum var. Önce bu yorumları yanıtlamanızı öneririm. Daha spesifik bir konuda yardım ister misiniz?`,
    `İşletmenizin verilerini analiz ettim. Ortalama puanınız ${avgRating}/5 ve ${pendingCount} bekleyen yanıt var. Hangi konuda daha fazla bilgi almak istersiniz?`,
    `${sector} sektöründe başarı için düzenli müşteri geri bildirimi çok önemli. Yanıt oranınızı artırmak için size özel bir strateji oluşturabilirim. Neleri merak ediyorsunuz?`,
  ];
  return generalReplies[Math.floor(Math.random() * generalReplies.length)];
}

// POST /api/consultant/chat
exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Mesaj zorunludur.' });

    const business = req.user.business;
    if (!business) return res.status(404).json({ message: 'İşletme bulunamadı.' });

    const reviews = await Review.find({ business: business._id }).limit(20);
    const reply = generateConsultantReply(message, business.name, business.sector, reviews);

    res.json({ reply });
  } catch (err) {
    next(err);
  }
};
