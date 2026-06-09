# Yanıtlıyor - Müşteri Yorum Yönetim Sistemi

BLG330 Web Programlama dersi kapsamında geliştirilen MERN stack projesi.

Canlı site: https://yanitliyor-projeiru-web.vercel.app

---

## Proje Hakkında

İşletmelerin müşteri yorumlarını tek panelden yönetmesini sağlayan bir web uygulamasıdır. Yorumlara otomatik yanıt taslağı oluşturur, istatistik gösterir ve üyelik sistemiyle kota yönetimi yapar.

---

## Kullanılan Teknolojiler

| | Teknoloji |
|--|--|
| Frontend | React, Vite, TailwindCSS, Axios |
| Backend | Node.js, Express.js |
| Veritabanı | MongoDB, Mongoose |
| Kimlik Doğrulama | JWT (JSON Web Token), bcrypt |

---

## Özellikler

- Kullanıcı kayıt ve giriş (JWT ile)
- İşletme paneli ve yorum listesi
- Yorumlara otomatik yanıt taslağı üretme
- Yorum onaylama / reddetme
- Admin paneli (tüm kullanıcıları görme, hesap engelleme)
- Üyelik katmanları (Deneme, Esnaf, Usta) ve aylık kota
- AI danışman (chatbot)

---

## Kurulum

### Gereksinimler
- Node.js 18+
- MongoDB (lokal) veya MongoDB Atlas

### Backend

```bash
cd backend
npm install
# .env dosyası oluştur (.env.example dosyasından kopyala)
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Test Verisi Yükleme

```bash
cd backend
node seed.js
```

Yüklenen hesaplar:
- Admin: admin@yanitliyor.com / Admin123!
- Demo: okul@demo.com / Okul123!

---

## API Endpointleri

| Method | Endpoint | Açıklama |
|--------|----------|---------|
| POST | /api/auth/register | Kayıt ol |
| POST | /api/auth/login | Giriş yap |
| GET | /api/reviews | Yorumları listele |
| POST | /api/reviews | Yorum ekle |
| PUT | /api/reviews/:id | Yorum güncelle |
| DELETE | /api/reviews/:id | Yorum sil |
| POST | /api/reviews/:id/action | Onayla / Reddet |
| GET | /api/dashboard | Dashboard verisi |
| GET | /api/admin/users | Tüm kullanıcılar (admin) |

---

## Veritabanı Modelleri

**User** — name, email, password (bcrypt), role, business (ref), isActive

**Business** — name, sector, owner (ref), membershipTier, monthlyQuota, currentUsage

**Review** — business (ref), customer_name, rating, comment, status, ai_reply

---

Geliştirici: Muzaffer Savcıoğlu — İstanbul Rumeli Üniversitesi, Bilgisayar Mühendisliği
