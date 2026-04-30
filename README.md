# 🌟 Yanıtlıyor - AI Destekli Müşteri İlişkileri Yönetimi (SaaS)

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100.0-009688.svg)](https://fastapi.tiangolo.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-orange.svg)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC.svg)](https://tailwindcss.com/)

**Yanıtlıyor**, işletmelerin Google Haritalar'daki dijital itibarlarını otomatize eden, yeni nesil bir **B2B SaaS (Hizmet olarak Yazılım)** platformudur. Müşteri yorumlarını otomatik çeker, yapay zeka ile sektöre özgü profesyonel taslaklar oluşturur ve rakiplerin SWOT analizini çıkarır. 

*Bu proje, yazılım mühendisliği lisans bitirme projesi kapsamında uçtan uca mimari (Separation of Concerns) prensiplerine sadık kalınarak geliştirilmiştir.*

---

## 🚀 Öne Çıkan Özellikler

- **🤖 Otonom Yorum Yanıtlama (AI):** Gelen her Google yorumunu okur; şikayet, övgü veya hakaret durumuna göre esnaf ya da kurumsal tonda taslak metin (draft) hazırlar.
- **📊 Duygu ve Durum Raporlaması:** Tüm müşteri verilerini okuyarak "Müşterilerinizin en çok övdüğü ve şikayet ettiği 2 konu" şeklinde işletme sahibine hap bilgiler sunar.
- **💬 AI İşletme Danışmanı:** İşletmenin yorumlarına ve sektörüne hakim olan chatbot modeli üzerinden anında büyüme stratejisi sorulabilir.
- **⚔️ Rakip SWOT Analizi:** Sadece kendi işletmeniz değil, rakiplerin Google Haritalar profilini çekerek zayıf/güçlü yönlerini ve nasıl ezip geçilebileceğini analiz eder.
- **🔒 Kota ve Abonelik Katmanları:** Deneme, Esnaf ve Usta olmak üzere yetkilendirilmiş abonelik ve kullanım kotaları (Trial/Tier-Based Access).
- **🛡️ Güvenli Google Login (OAuth 2.0):** Şifresiz, tek tıkla işletme hesabı bağlama yeteneği.

---

## 🏗️ Teknoloji Yığını (Tech Stack)

Sistem İstemci-Sunucu (Client-Server) mimarisiyle tamamen izole katmanlar halinde çalışmaktadır.

| Katman | Teknoloji / Kütüphane | Kullanım Amacı |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS, Axios | Hızlı SPA deneyimi (Single Page Application), Responsive ve modern arayüz tasarımı. |
| **Backend** | Python, FastAPI | Asenkron, ultra hızlı API rotaları ve arka plan işlemleri. |
| **Veritabanı** | SQLite, SQLAlchemy ORM | Veri Kalıcılığı (Data Persistence), One-to-Many ilişkisel modelleme. |
| **AI Motoru** | Google Generative AI (Gemini Flash) | Doğal Dil İşleme (NLP), Bağlamsal içerik/yanıt ve özet üretimi. |
| **Entegrasyon**| Google Maps API & Oauth 2.0 | İşletme lokasyonlarını bulma, yorumları çekme ve güvenli kimlik doğrulama. |

---

## 🛡️ Mimari ve Güvenlik
- **Separation of Concerns:** Kullanıcı arayüzü, API yolları ve AI iş parçacıkları (`ai_engine.py`) tamamen modüller halinde ayrılmıştır.
- **Least Privilege:** Google Haritalar üzerindeki 31 servisten API kotalarını veya fatura istismarlarını (Billing Exploit) engellemek adına sadece **Places API** okuma yetkisiyle kısıtlanmıştır.
- **Koruma:** Hasas .env bilgileri, token şifreleri ve DB uzantıları Git takibinden dışlanarak (.gitignore) kodun güvenli şekilde public repolarda paylaşılabilmesi güvence altına alınmıştır.

---
*Geliştirici: [Muzaffer Savcıoğlu] - Yazılım Mühendisliği Bitirme Projesi*
