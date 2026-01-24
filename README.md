# 📜 Osmanlı Arşivleri - Ottoman Archives

> **Modern web teknolojileriyle Osmanlıca öğrenme platformu**

Osmanlı belgelerini okumayı öğrenmek için interaktif, eğlenceli ve etkili bir platform.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://ottoman-archives.vercel.app)
[![Built with](https://img.shields.io/badge/built%20with-React%2019-61dafb)](https://react.dev)
[![Database](https://img.shields.io/badge/database-Supabase-3ecf8e)](https://supabase.com)
[![Deployment](https://img.shields.io/badge/deploy-Vercel-black)](https://vercel.com)

---

## ✨ Özellikler

### 🎯 Öğrenme Sistemi
- **Interaktif Belgeler**: Gerçek Osmanlı belgeleri üzerinde kelime kelime öğrenme
- **İlerleme Takibi**: Öğrenilen kelimeler, tamamlanan belgeler, günlük streak
- **Rozet Sistemi**: Başarılarınızı unlock edin (10 kelime, 50 belge, 7 gün serisi...)
- **Spaced Repetition**: Unutmadan önce tekrar edin
- **Favori Kelimeler**: Zorlandığınız kelimeleri işaretleyin

### 📚 Belge Yönetimi
- **Admin Panel**: Belgeler ekleyin, düzenleyin, silin
- **Görsel Upload**: Yüksek çözünürlüklü belge görselleri
- **Zorluk Seviyeleri**: Kolay, Orta, Zor
- **Kategoriler**: Hukuki, Siyasi, Edebi, vb.

### 🔐 Güvenlik & Auth
- **Supabase Auth**: Güvenli oturum yönetimi
- **Email Verification**: Hesap doğrulama
- **Row Level Security**: Kullanıcı verileri izole
- **Admin Yetkileri**: Rol bazlı erişim kontrolü

### 📊 Gamification
- **XP Sistemi**: Her doğru cevap 10 XP, yanlış 2 XP
- **Seviyeler**: Başlangıç → Orta → İleri → Uzman
- **Liderboard**: Diğer öğrencilerle yarışın
- **Günlük Hedefler**: 10 kelime/gün

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- **Node.js** 18+ ([Download](https://nodejs.org))
- **npm** 9+ (Node ile gelir)

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/YOUR_USERNAME/ottoman-archives.git
cd ottoman-archives
```

### 2. Bağımlılıkları Kurun
```bash
npm install
```

### 3. Environment Variables
`.env` dosyası oluşturun:
```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_ENV=development
```

> **LocalStorage Mode**: `.env` yoksa otomatik LocalStorage kullanır!

### 4. Geliştirme Sunucusu
```bash
npm run dev
```

🎉 Tarayıcıda açın: [http://localhost:5173](http://localhost:5173)

---

## 📦 Production Deployment

**Detaylı rehber:** [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)

### Hızlı Özet:
1. **Supabase**: Proje oluştur, SQL schema deploy et → [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)
2. **Vercel**: GitHub'dan import et, env variables ekle
3. **Deploy**: Otomatik build & deploy
4. **Test**: Signup, login, belgeler, progress

**Tahmini Süre:** ~45 dakika  
**Maliyet:** $0/ay (free tier)

---

## 🛠️ Teknoloji Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Routing
- **Lucide Icons** - Icon set

### Backend
- **Supabase** - PostgreSQL database
- **Supabase Auth** - Authentication
- **Supabase Storage** - File storage
- **Row Level Security** - Data security

### DevOps
- **Vercel** - Hosting & CI/CD
- **GitHub** - Version control
- **PWA** - Progressive Web App

---

## 📂 Proje Yapısı

```
ottoman-archives/
├── src/
│   ├── components/        # UI bileşenleri
│   │   ├── admin/        # Admin panel
│   │   ├── DocumentViewer.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ...
│   ├── pages/            # Sayfa componentleri
│   │   ├── auth/         # Login, Signup
│   │   ├── admin/        # Admin sayfaları
│   │   └── ...
│   ├── context/          # React Context (state management)
│   │   ├── AuthContext.tsx
│   │   ├── LearningContext.tsx
│   │   └── ...
│   ├── services/         # Backend servisleri
│   │   ├── AuthService.ts       # Hybrid: Supabase + LocalStorage
│   │   ├── DocumentService.ts   # Hybrid: PostgreSQL + Storage
│   │   ├── FeedbackService.ts   # Error reporting
│   │   └── LearningService.ts   # Progress tracking
│   ├── lib/              # Supabase client & types
│   │   ├── supabase.ts
│   │   └── database.types.ts
│   ├── data/             # Initial data
│   └── App.tsx           # Root component
├── public/               # Static assets
├── vercel.json          # Vercel config
├── .env.example         # Environment template
└── package.json
```

---

## 🎨 Ekran Görüntüleri

### Ana Sayfa
Modern, temiz arayüz ile Osmanlıca öğrenmeye başlayın.

### Belge Görüntüleyici
İnteraktif kelime işaretleme sistemli belge okuyucu.

### İlerleme Sayfası
Öğrenme istatistiklerinizi, rozetlerinizi ve streak'inizi takip edin.

### Admin Panel
Belgeler ekleyin, geri bildirimleri yönetin.

---

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak isterseniz:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

---

## 📝 Lisans

Bu proje MIT lisansı altındadır.

---

## 👤 Geliştirici

**İlhan** - [GitHub](https://github.com/YOUR_USERNAME)

---

## 🙏 Teşekkürler

- Osmanlı belgelerini sağlayan arşivlere
- Açık kaynak topluluğuna
- Beta test kullanıcılarına

---

## 📧 İletişim

Sorularınız için:
- 📧 Email: your-email@example.com
- 🐦 Twitter: @yourhandle
- 💬 Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/ottoman-archives/issues)

---

**Osmanlıca öğrenmeyi kolaylaştırıyor, eğlenceli hale getiriyoruz! 📜✨**
