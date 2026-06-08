// Veritabanını örnek verilerle doldur
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Business = require('./models/Business');
const Review = require('./models/Review');

const REVIEWS_OKUL = [
  { customer_name: 'Elif Demir', rating: 5, comment: 'Yemekler gerçekten lezzetli ve çeşitli. Personel çok ilgili ve güler yüzlü. Çocuklarımız çok memnun.', date: '3 gün önce', status: 'approved', ai_reply: 'Değerli yorumunuz için çok teşekkür ederiz! Öğrencilerimizin mutluluğu bizim en büyük motivasyonumuz. Sizi tekrar aramızda görmekten mutluluk duyarız!', is_historical: true },
  { customer_name: 'Mehmet Kaya', rating: 4, comment: 'Genel olarak kaliteli ve temiz bir ortam. Yemekler sağlıklı ve besleyici. Fiyatlar öğrenci bütçesine uygun.', date: '1 hafta önce', status: 'approved', ai_reply: 'Teşekkürler! Sağlıklı ve uygun fiyatlı hizmet sunmak önceliğimizdir.', is_historical: true },
  { customer_name: 'Zeynep Arslan', rating: 2, comment: 'Bekleme süreleri çok uzun, yoğun saatlerde kuyruk saatler sürüyor. Personel sayısı artırılmalı.', date: '5 gün önce', status: 'pending', ai_reply: 'Yaşadığınız bekleme sorunu için özür dileriz. Yoğun saatlerde personel takviyesi yaparak bu sorunu çözeceğiz.', is_historical: false },
  { customer_name: 'Ali Öztürk', rating: 5, comment: 'Kantinin menüsü her hafta değişiyor ve çok çeşitli. Vejetaryen seçeneklerin de olması harika. Kesinlikle tavsiye ederim.', date: '2 hafta önce', status: 'approved', ai_reply: 'Güzel yorumunuz için teşekkür ederiz! Çeşitli ve sağlıklı seçenekler sunmaya devam edeceğiz.', is_historical: true },
  { customer_name: 'Fatma Şahin', rating: 3, comment: 'Yemekler orta düzeyde. Bazen soğuk geliyor tabaklar. Sıcaklık konusuna dikkat edilmeli.', date: '10 gün önce', status: 'pending', ai_reply: 'Geri bildiriminiz için teşekkür ederiz. Yemek sıcaklığı konusunda mutfağımızı uyardık, en kısa sürede düzelteceğiz.', is_historical: false },
  { customer_name: 'Kemal Yıldız', rating: 5, comment: 'Temizliğe çok önem veriyorlar. Masalar düzenli temizleniyor, mutfak hijyen konusunda titiz. Harika!', date: '1 ay önce', status: 'approved', ai_reply: 'Hijyen ve temizlik konusundaki hassasiyetimizi fark etmeniz bizi çok mutlu etti, teşekkür ederiz!', is_historical: true },
  { customer_name: 'Selin Çelik', rating: 1, comment: 'Bugün yemekte böcek gördüm. Bu kabul edilemez. Yetkililer acilen müdahale etmeli.', date: '2 gün önce', status: 'pending', ai_reply: 'Bu deneyim için derin özrümüzü sunarız. Durumu derhal inceliyoruz ve gerekli sağlık denetimlerini başlatıyoruz. Lütfen bizimle iletişime geçin.', is_historical: false },
  { customer_name: 'Emre Doğan', rating: 4, comment: 'Öğle aralarında kalabalık olsa da servis hızı iyi. Çorba her zaman lezzetli oluyor.', date: '3 hafta önce', status: 'approved', ai_reply: 'Teşekkür ederiz! Çorbalarımız için özel emek harcıyoruz, bunu fark etmeniz çok değerli.', is_historical: true },
  { customer_name: 'Ayşe Koç', rating: 5, comment: 'Okul kantini için çok başarılı bir yönetim. Çocuğum her gün memnun geliyor. Teşekkürler.', date: '1 hafta önce', status: 'pending', ai_reply: 'Öğrencilerimizin mutluluğu en büyük ödülümüz. Güzel yorumunuz için çok teşekkür ederiz!', is_historical: false },
  { customer_name: 'Burak Polat', rating: 3, comment: 'Fiyatlar biraz yüksek geldi ama kalite fena değil. Porsiyon miktarları artırılabilir.', date: '4 gün önce', status: 'pending', ai_reply: 'Geri bildiriminizi değerlendiriyoruz. Fiyat-porsiyon dengesini gözden geçireceğiz.', is_historical: false },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlandı');

    // Eski test verilerini temizle
    await User.deleteMany({ email: { $in: ['admin@yanitliyor.com', 'okul@demo.com'] } });
    console.log('Eski veriler temizlendi');

    // ─── 1. ADMİN HESABI ───────────────────────────────
    const adminUser = await User.create({
      name: 'Sistem Yöneticisi',
      email: 'admin@yanitliyor.com',
      password: 'Admin123!',
      role: 'admin',
    });

    const adminBusiness = await Business.create({
      name: 'Yanıtlıyor Yönetim Paneli',
      sector: 'Genel',
      owner: adminUser._id,
      membershipTier: 2,
      packageName: 'Usta Paketi',
      monthlyQuota: 9999,
      currentUsage: 0,
    });
    adminUser.business = adminBusiness._id;
    await adminUser.save({ validateBeforeSave: false });

    // ─── 2. ÖRNEK HESAP: OKUL KANTİNİ ─────────────────
    const schoolUser = await User.create({
      name: 'Ahmet Yılmaz',
      email: 'okul@demo.com',
      password: 'Okul123!',
      role: 'user',
    });

    const schoolBusiness = await Business.create({
      name: 'Atatürk Lisesi Kantini',
      sector: 'Kafe',
      owner: schoolUser._id,
      membershipTier: 1,
      packageName: 'Esnaf Paketi',
      monthlyQuota: 50,
      currentUsage: 4,
      membershipEnd: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 22 gün kaldı
    });
    schoolUser.business = schoolBusiness._id;
    await schoolUser.save({ validateBeforeSave: false });

    // Yorumları ekle
    const reviews = await Review.insertMany(
      REVIEWS_OKUL.map((r) => ({ ...r, business: schoolBusiness._id }))
    );

    console.log('\n✅ VERİTABANI BAŞARIYLA OLUŞTURULDU\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 ADMİN HESABI');
    console.log('   E-posta : admin@yanitliyor.com');
    console.log('   Şifre   : Admin123!');
    console.log('   Yetki   : Admin (tüm kullanıcıları görebilir)');
    console.log('');
    console.log('🏫 ÖRNEK HESAP');
    console.log('   E-posta : okul@demo.com');
    console.log('   Şifre   : Okul123!');
    console.log('   İşletme : Atatürk Lisesi Kantini');
    console.log('   Paket   : Esnaf Paketi (22 gün kaldı)');
    console.log(`   Yorumlar: ${reviews.length} adet eklendi`);
    console.log('   Bekleyen: 5 yorum yanıt bekliyor');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('HATA:', err.message);
    process.exit(1);
  }
}

seed();
