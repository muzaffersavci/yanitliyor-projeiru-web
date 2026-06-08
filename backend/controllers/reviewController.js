const Review = require('../models/Review');
const Business = require('../models/Business');

// Rating'e göre basit AI yanıt oluşturucu
function generateAiReply(comment, rating, businessName, sector) {
  if (!comment || comment.trim() === '') return 'İlginiz için teşekkür ederiz!';

  if (rating >= 4) {
    const replies = [
      `Değerli yorumunuz için çok teşekkür ederiz! ${businessName} olarak müşterilerimizin memnuniyeti her zaman önceliğimizdir. Sizi tekrar ağırlamaktan mutluluk duyarız!`,
      `Harika geri bildiriminiz için minnettarız! ${sector} alanında en iyi hizmeti sunmak için her zaman çalışıyoruz. Tekrar görüşmek üzere!`,
      `Bu güzel yorumunuz ekibimize büyük motivasyon verdi! ${businessName} olarak sizi tekrar aramızda görmek isteriz.`,
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  if (rating <= 2) {
    const replies = [
      `${businessName} olarak yaşadığınız olumsuz deneyim için içtenlikle özür dileriz. Bu geri bildirimi ekibimizle değerlendirip gerekli iyileştirmeleri yapacağız. Lütfen bizimle iletişime geçin, sizi memnun etmek isteriz.`,
      `Yorumunuz için teşekkür ederiz. Yaşadığınız sorundan dolayı üzüntü duyuyoruz. Hizmet kalitemizi iyileştirmek için bu deneyimi ciddiye alıyoruz.`,
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // Rating 3
  const neutralReplies = [
    `Değerli geri bildiriminiz için teşekkür ederiz. Hizmet kalitemizi daha da iyileştirmek için yorumlarınızı dikkate alıyoruz.`,
    `Zaman ayırıp değerlendirme yaptığınız için teşekkürler! Daha iyi olmak için çalışmaya devam ediyoruz.`,
  ];
  return neutralReplies[Math.floor(Math.random() * neutralReplies.length)];
}

// Yorumlardan anahtar kelime analizi
function analyzeReviews(reviews) {
  if (!reviews.length) {
    return { positives: ['Veri Bekleniyor'], negatives: [], advice: 'Yorum ekleyerek analiz başlatın.' };
  }

  const positiveKeywords = [
    { kw: 'lezzetli', label: 'Lezzetli yemekler' },
    { kw: 'temiz', label: 'Temizlik' },
    { kw: 'hızlı', label: 'Hızlı servis' },
    { kw: 'güler yüzlü', label: 'Güler yüzlü personel' },
    { kw: 'harika', label: 'Harika deneyim' },
    { kw: 'mükemmel', label: 'Mükemmel kalite' },
    { kw: 'tavsiye', label: 'Tavsiye edilen yer' },
    { kw: 'kaliteli', label: 'Kaliteli ürün/hizmet' },
    { kw: 'güzel', label: 'Güzel atmosfer' },
    { kw: 'iyi', label: 'İyi hizmet kalitesi' },
  ];

  const negativeKeywords = [
    { kw: 'kötü', label: 'Kötü hizmet' },
    { kw: 'yavaş', label: 'Yavaş servis' },
    { kw: 'soğuk', label: 'Soğuk yemek/içecek' },
    { kw: 'kirli', label: 'Temizlik sorunu' },
    { kw: 'pahalı', label: 'Fiyat-performans dengesi' },
    { kw: 'kaba', label: 'Personel tutumu' },
    { kw: 'bekleme', label: 'Uzun bekleme süresi' },
    { kw: 'hayal kırıklığı', label: 'Hayal kırıklığı yaratan deneyim' },
    { kw: 'berbat', label: 'Berbat deneyim' },
  ];

  const positiveScore = {};
  const negativeScore = {};

  reviews.forEach((r) => {
    const text = (r.comment || '').toLowerCase();
    positiveKeywords.forEach(({ kw, label }) => {
      if (text.includes(kw)) positiveScore[label] = (positiveScore[label] || 0) + 1;
    });
    negativeKeywords.forEach(({ kw, label }) => {
      if (text.includes(kw)) negativeScore[label] = (negativeScore[label] || 0) + 1;
    });
  });

  const positives = Object.entries(positiveScore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);

  const negatives = Object.entries(negativeScore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;

  let advice;
  if (avgRating >= 4.5) advice = 'Müşteri memnuniyetiniz mükemmel! Olumlu yorumları sosyal medyada paylaşın ve bu başarıyı sürdürün.';
  else if (avgRating >= 3.5) advice = `${pendingCount} yanıt bekleyen yorumunuz var. Yanıt oranınızı artırarak Google sıralamanızı yükseltebilirsiniz.`;
  else advice = 'Düşük puanlı yorumlara odaklanın. Müşteri şikayetlerini dikkate alarak hizmet kalitenizi geliştirin.';

  return { positives: positives.length ? positives : ['Henüz analiz için yeterli veri yok'], negatives, advice };
}

// GET /api/reviews
exports.getReviews = async (req, res, next) => {
  try {
    const business = req.user.business;
    if (!business) return res.status(404).json({ message: 'İşletmeniz bulunamadı.' });

    const reviews = await Review.find({ business: business._id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const business = req.user.business;
    if (!business) return res.status(404).json({ message: 'İşletmeniz bulunamadı.' });

    const { customer_name, rating, comment, date } = req.body;

    if (!customer_name || !rating) {
      return res.status(400).json({ message: 'Müşteri adı ve puan zorunludur.' });
    }

    const ai_reply = generateAiReply(comment, parseInt(rating), business.name, business.sector);

    const review = await Review.create({
      business: business._id,
      customer_name,
      rating: parseInt(rating),
      comment: comment || '',
      date: date || 'Bugün',
      ai_reply,
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

// PUT /api/reviews/:id
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Yorum bulunamadı.' });

    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Yorum bulunamadı.' });
    res.json({ message: 'Yorum silindi.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/reviews/:id/action?action=approve|save_draft&reply=...
exports.reviewAction = async (req, res, next) => {
  try {
    const { action, reply } = req.query;
    const review = await Review.findById(req.params.id).populate('business');
    if (!review) return res.status(404).json({ message: 'Yorum bulunamadı.' });

    const business = review.business;

    if (action === 'approve') {
      if (business.membershipTier === 0) {
        return res.status(403).json({ detail: 'Deneme modunda yorumları onaylayamazsınız. Paket alarak tüm özelliklere erişin.' });
      }
      if (business.currentUsage >= business.monthlyQuota) {
        return res.status(402).json({ detail: 'Aylık yanıt kotanız dolmuştur.' });
      }
      review.status = 'approved';
      if (reply) review.ai_reply = reply;
      if (!review.is_historical) {
        business.currentUsage += 1;
        await business.save();
      }
    } else if (action === 'save_draft') {
      review.status = 'pending';
      if (reply) review.ai_reply = reply;
    }

    await review.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard (dashboard verisi)
exports.getDashboard = async (req, res, next) => {
  try {
    const user = req.user;
    const business = user.business;

    if (!business) {
      return res.status(401).json({ detail: 'İşletmeniz bulunamadı.' });
    }

    let reviewQuery = Review.find({ business: business._id }).sort({ createdAt: -1 });

    if (business.membershipTier === 0) {
      reviewQuery = reviewQuery.limit(5);
    }

    const reviews = await reviewQuery;
    const pendingCount = reviews.filter((r) => r.status === 'pending').length;
    const analysis = analyzeReviews(reviews);
    const daysLeft = business.membershipEnd
      ? Math.max(0, Math.ceil((new Date(business.membershipEnd) - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;

    res.json({
      business: {
        name: business.name,
        tier: business.packageName,
        membership_tier: business.membershipTier,
        has_gmb: false,
        email: user.email,
        auto_password: '',
        days_left: daysLeft,
        quota_used: business.currentUsage,
        quota_limit: business.monthlyQuota,
        can_competitor: business.membershipTier >= 1,
        is_admin: user.role === 'admin',
      },
      stats: { total: reviews.length, pending: pendingCount, analysis },
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

exports.generateAiReply = generateAiReply;
exports.analyzeReviews = analyzeReviews;
