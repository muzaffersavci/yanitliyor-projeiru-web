# YANITLIYOR - BİREYSEL BİTİRME PROJESİ RAPORU

## 1. Giriş (Introduction)
"Yanıtlıyor", işletmelerin müşteri geri bildirimlerini Google Haritalar üzerinden otomatik olarak çekip analiz etmelerini ve yapay zeka (Gemini 2.5) destekli akıllı yanıtlar oluşturmalarını sağlayan yenilikçi bir web platformudur. Bu projenin amacı, işletmelerin dijital itibarlarını yönetmelerini hızlandırmak, müşteri memnuniyetini (duygu analizi ile) ölçmek ve profesyonel bir kurumsal duruş sergilemelerini sağlamaktır. Sistem, frontend tarafında React/Vite, backend tarafında FastAPI ve veritabanı olarak SQLite kullanarak geliştirilmiş, modern yazılım mühendisliği prensiplerine (RESTful API, servis odaklı mimari) sadık kalınmıştır.

## 2. Gereksinimlerin Özeti (Requirements Summary)

**İşlevsel Gereksinimler (Functional Requirements):**
1. **Kimlik Doğrulama:** Google OAuth ve e-posta tabanlı manuel giriş/kayıt sistemi.
2. **Otomasyon & Veri Entegrasyonu:** Google İşletme Profilinden otomatik yorum ve mekan verisi çeken API entegrasyonu.
3. **Akıllı Yanıt Üretimi:** Yapay zeka ile olumlu/olumsuz yorumları ayrıştırarak sektöre ve seçilen tona uygun (örn: empatik, profesyonel) otomatik taslak yanıt oluşturma.
4. **Duygu ve Durum Analizi:** Gelen yorumlardan en çok övülen/şikayet edilen noktaların json formatında raporlanması.
5. **AI İşletme Danışmanı:** İşletme verilerine hakim ve strateji veren Chatbot arayüzü.
6. **Rakip SWOT Analizi:** Başka işletmelerin Google yorumlarına dayanarak zayıf ve güçlü yanlarını analiz etme yeteneği.
7. **Rol ve Yetki Yönetimi:** Admin ile Kullanıcı ayrımı, onay/taslak aşamalı yorum paneli.
8. **Abonelik & Kota Sistemi:** İşletmeler için aylık kota ve paket yönetimi (Deneme, Esnaf, Usta).

**İşlevsel Olmayan Gereksinimler (Non-Functional Requirements):**
1. **Güvenlik:** Hassas API anahtarlarının `.env` ile korunması, CORS politikalarının ayarlanması ve JWT tarzı Token bazlı endpoint koruması.
2. **Kullanılabilirlik ve Tasarım:** TailwindCSS kullanılarak hazırlanan, tüm cihazlara tam uyumlu (responsive) ve sezgisel kullanıcı arayüzü.
3. **Modülerlik ve Sürdürülebilirlik (Maintainability):** Bileşenlerin, API yollarının ve AI motorunun (ai_engine.py) tamamen izole edilerek temiz kod (clean code) prensiplerine uygun tasarlanması.

## 3. Tasarım Açıklaması (Design Explanation)
Sistem Mimarisi İstemci-Sunucu (Client-Server) modeline dayanmaktadır.
- **Frontend (Kullanıcı Arayüzü):** ReactJS ve Vite kullanılarak SPA (Single Page Application) olarak inşa edilmiştir. State yönetimi Context API veya component stateleri ile yapılmış, React Router ile sayfalar arası yönlendirme sağlanmıştır.
- **Backend (API ve İş Mantığı):** FastAPI kullanılmıştır. FastAPI yüksek performanslı ve asenkron yeteneklere sahip bir Python web framework'üdür. `ai_engine.py` üzerinden Google Generative AI (Gemini) servisleriyle konuşulmaktadır.
- **Veri Kalıcılığı:** SQLAlchemy ORM kullanılarak SQLite ilişkisel veritabanı üzerinde modelleme yapılmıştır (`UserDB`, `BusinessDB`, `ReviewDB`, `CompetitorDB`, `AnalysisLogDB`). İlgili tablolar arasında foreign key ilişkileri kurularak veri bütünlüğü sağlanmıştır (Örn: Bir kullanıcının bir işletmesi vardır, bir işletmenin birden çok yorumu olabilir - One-to-Many).
- **Separation of Concerns (Sorumlulukların Ayrılması):** Rotalar (endpoints), veritabanı modelleri, AI işlem mantığı ayrı katmanlarda kurgulanarak sistemin bakımı kolaylaştırılmıştır.

## 4. Uygulama Genel Bakışı (Implementation Overview)
Projenin temel iskeleti canlı çalışacak şekilde uygulanmıştır. Kullanıcı sisteme girdiğinde bir haritalar işletmesi bağlar. Uygulama Google Maps API ile verileri indirir. Backend tarafındaki `/api/business/fetch-reviews` rotası ile çekilen yorumlar veritabanına `pending` statusunda ve AI tarafından cevaplanmış bir `ai_reply` draftı ile kaydedilir. Frontend kısmında bu kayıtlar `Recharts` ile kütüphaneleriyle grafikselleştirilerek Dashboard'da sunulur. Onaylanan her yorum kullanıcının aylık kotasını düşürür. Bütün bu akış Token Header üzerinden yetki doğrulamasıyla gerçekleşir.

## 5. Test Sonuçları (Testing Results)
- **API Testleri:** Endpointler için Postman (veya FastAPI'nin yerleşik Swagger/OpenAPI arayüzü) üzerinden yapılan manuel entegrasyon testleri başarılı olmuştur.
- **Güvenlik Testi:** Yetkisiz bir token ile korumalı `/api/dashboard` erişiminin 401 Unauthorized hatası fırlattığı doğrulanmıştır.
- **Performans:** Yüksek boyutlu AI prompt talepleri için Time.sleep (gerçekçi bekleme) implementasyonları ile rate limit (Google AI 429 hatası) sömürüsü başarıyla engellenmiştir.

## 6. Sınırlamalar (Limitations)
- Geliştirilmiş bir mikroservis yapısı yerine tek bir Monolithic Backend yapısı bulunmaktadır. Ölçekleme aşamasında (milyonlarca istek) load balancer kullanılması zorunludur.
- Veritabanı şu an SQLite'tır. Canlı üretim ortamı için (Production) PostgreSQL veya MySQL'e geçiş sağlanmalıdır.
- Mevcut yapı sadece metin tabanlı analizler üretmektedir, fotoğraf analizi (vizyon modelleri) işletme yorumlarında desteklenmemektedir.

## 7. Gelecekteki İyileştirmeler (Future Improvements)
- Google İşletme Profili hesabı üzerinden otomatik yorumları direkt Google platformuna gönderecek resmi Write-API entegrasyonu (şu an Google Business onayı beklemektedir).
- Kullanıcıların şube veya çalışan performansını takip edebilecekleri "Şube Yetkilisi (Manager)" isimli 3. parti hibrid bir kullanıcı rolü.
- Veritabanı yönetiminin PostgreSQL gibi çok eşzamanlı işlemi destekleyen motorlara geçirilmesi.
- Müşterilere SMS veya WhatsApp üzerinden doğrudan analiz raporlarının otomatik iletimi.
