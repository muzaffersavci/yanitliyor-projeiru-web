# YANITLIYOR - PROJE MİMARİSİ VE KOD REHBERİ

Bütün sistemi hocanın veya jürinin karşısında rahatça açıklayabilmen için projenin **"Neresi ne işe yarar? Hangi dosya ne yapar?"** sorularını cevaplayan özet (ama hiçbir şeyin atlanmadığı) rehberin aşağıdadır.

---

## 1. GENEL MİMARİ (İstemci - Sunucu Modeli)
Proje klasik ve modern bir **Client-Server (İstemci - Sunucu)** mimarisiyle tasarlanmıştır. 
Proje klasörü temel olarak iki dev yapıya bölünmüştür: `frontend` (Ön yüz - Arayüz) ve `backend` (Arka yüz - Sunucu ve Çekirdek). Frontend ve Backend birbirleriyle sadece **RESTful API** (JSON formatındaki veri paketleri) aracılığıyla iletişim kurar. Bu yaklaşıma "Separation of Concerns" (Sorumlulukların ayrılması) denir.

---

## 2. BACKEND KLASÖRÜ (Sistemin Beyni ve Çekirdeği)
Arka planda **Python** kullanılmıştır. Web çatısı (Framework) olarak saniyede binlerce isteği asenkron (eşzamanlı) olarak kaldırabilen **FastAPI** seçilmiştir.

### A. `backend/main.py` (Orkestrasyon ve API)
Bu dosya projenin kalbidir. Bütün veritabanı iletişimi ve gelen isteklerin karşılandığı yerdir.
- **REST API Rotaları (Endpoints):** `/api/auth/login`, `/api/dashboard`, `/api/business/fetch-reviews` gibi Frontend'in veri istediği kapılar bu dosyada tanımlanır.
- **Güvenlik (Auth & CORS):** Token bazlı yetkilendirme (`get_user_from_token`) burada çalışır. Tokeni olmayan veya süresi dolan istekleri buradan 401/403 hatalarıyla reddedilir.
- **Veritabanı Modelleri (SQLAlchemy):** SQLAlchemy OMR (Nesne-İlişkisel Eşleme) aracı ile sınıflar tabloya dönüştürülür.
  - `UserDB`: Sisteme üye olan kullanıcıları (Admin veya Müşteri) tutar.
  - `BusinessDB`: Kullanıcının Google Haritalardaki işletmesini, kalan kotasını ve abonelik süresini tutar (One-to-Many).
  - `ReviewDB`: İşletmeye gelen Google Haritalar müşteri yorumlarını ve yapay zeka taslak yanıtlarını tutar.
  - `CompetitorDB` ve `AnalysisLogDB`: Yapılan analizlerin sonuçlarını, her seferinde tekrar para ödememek (API limiti harcamamak) için önbellekte (Cache/Veritabanında) saklar.
  
### B. `backend/ai_engine.py` (Yapay Zeka Motoru)
Gemini (Google AI) modellerini bir kutuya koyup soyutladığımız dosyadır. `main.py` direkt yapay zekaya dokunmaz, ihtiyacı olunca `ai_engine.py`'deki şu fonksiyonları çağırır:
- `ai_reply_gen()`: Müşteri yorumunu okur, sitemkar mı, övgü mü, saldırı mı olduğunu tespit edip işletmenin tonuna göre esnaf/kurumsal bir yanıt yazar.
- `generate_analysis()`: Gelen tüm yorumları derler, özet çıkarır (Zayıf yanlarımız şunlar, övüldüğümüz yanlar şunlar diye JSON döner).
- `analyze_competitor_deep()`: Rakipler için SWOT analizi yapar. 

### C. Yapılandırma Dosyaları (`.env` ve `requirements.txt`)
- **`.env`:** Gizli kasa. Google Client ID, Gemini API gibi kimsenin görmemesi gereken şifreler buradadır. GitHub'a atılmaz.
- **`requirements.txt`:** Projenin backend tarafında bağımlı olduğu Python kütüphanelerinin listesidir (FastAPI, uvicorn, google-generativeai vb.).

---

## 3. FRONTEND KLASÖRÜ (Kullanıcı Tarafı)
Kullanıcının gördüğü butonlar, ekranlar ve grafikler bu yandadır. Tarayıcıda çalışır. **React** ve inşa aracı olarak **Vite** kullanılmıştır.

### A. Konfigürasyonlar
- **`package.json`:** Frontend'deki bağımlılıkları (`react`, `axios`, `recharts` - grafik çizimi için-, `lucide-react` - ikonlar için-) depolar.
- **`vite.config.js`:** React projesini çalıştırmak, derlemek ve minimum boyuta getirmek (build) için kullanılan motorun ayarları.
- **`tailwind.config.js`:** CSS yazmadan sınıflarla çok hızlı tasarım yapmamızı sağlayan Tailwind kütüphanesinin ayar dosyasıdır. Bütün responsivite (mobil uyumu) bununla yapılmıştır.
- **`index.html`:** Projenin içine doğduğu tek sayfadır (Single Page Application - SPA). `<div id="root"></div>` içine tüm Reack enjekte edilir.

### B. Mimarideki Bileşen Yapısı (İçerikler nasıl akar?)
*(Frontend'in React standartları gereği şu şekilde parçalara bölünmüştür)*
- **Pages (Sayfalar):** Login Sayfası, Gösterge Paneli (Dashboard), Raporlama ekranı gibi bütünsel ekranlar.
- **Components (Bileşenler):** Grafik kutuları (`Recharts`), yorum kartları, menü (Sidebar) gibi tekrar eden LEGO parçacıkları.
- **API Fetching (Veri İletişimi):** `axios` kütüphanesi kullanılarak `http://localhost:8000/api/...` backend tarafına GET/POST istekleri atılır.

---

## 4. SİSTEMİN YAŞAM DÖNGÜSÜ (BİR İSTEK NASIL İŞLENİR?)
Hoca sana **"Peki, kullanıcının Google yorumları nasıl çekiliyor ve nasıl analiz ediliyor, baştan sona anlat"** derse şu akışı ezbere söylemelisin:

1. **Frontend İsteği:** Kullanıcı arayüzde "Canlı Veri Çek" butonuna basar. React, Axios paketini kullanarak Backend'e `/api/business/fetch-reviews` rotasına bir `POST` isteği gönderir ve şifrelenmiş Token'ını Header'da sunar.
2. **Backend Güvenlik Duvarı:** `main.py`'deki `get_user_from_token` middleware'i araya girer. "Bu token gerçekten bir işletme sahibine mi ait?" diye bakar. Sahteyse doğrudan hata (401) fırlatarak operasyonu iptal eder.
3. **Google API'ye Ulaşım:** Kimlik geçerliyse Backend, veritabanından adamın `google_place_id` (Google Kodu) verisini bulur ve Google Haritalar API'sine gidip en yeni yorumları bir liste olarak indirir.
4. **Zeka Motoru Devrede (`ai_engine.py`):** İnen yorumlar daha veritabanına yazılmadan önce `ai_engine.py`'ye paslanarak her yorum için "Buna uygun bir taslak çıkar" komutu verilir.
5. **Veritabanına Yazım (`SQLAlchemy`):** Sonuçlar elde edilince DB'ye `pending` (bekliyor) statüsü ve `ai_reply` draftı (taslağı) ile `ReviewDB` tablosuna satır satır yazılır (`db.commit()`).
6. **Frontend'e Dönüş:** Backend "**Başarılı: Yeni yorumlar çekildi**" json yanıtı döner. Frontend bunu alır, React'ın *State* algoritması tetiklenir ve ekrandaki grafikler - sayfa yenilenmeden - anından görsel olarak güncellenir.

İşte Yanıtlıyor sistemi bu kadar modern ve saat gibi işleyen bir mimari üzerine kuruludur.
