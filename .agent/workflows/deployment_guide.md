---
description: Guide to deploying the Ottoman Toolkit as a real website
---

# Projeyi Gerçek Bir Web Sitesine Dönüştürme Rehberi

Şu anki projeniz (React + Node.js + SQLite), modern web standartlarına tam uyumludur ve "gerçek" bir web sitesi olarak yayınlanmaya hazırdır. İşte izlemeniz gereken adımlar:

## 1. Hazırlık (Build)

Uygulamanızın canlıya alınmadan önce "derlenmesi" gerekir.

1.  **Frontend Build:**
    React kodlarınızı tarayıcıların anlayacağı optimize edilmiş HTML/CSS/JS dosyalarına dönüştürün.
    ```bash
    cd client
    npm run build
    ```
    Bu işlem `client/dist` klasörünü oluşturur.

2.  **Backend Ayarı:**
    Sunucunuz (`server/index.js`) zaten bu `dist` klasörünü sunacak şekilde ayarlandı:
    ```javascript
    app.use(express.static(path.join(__dirname, '../client/dist')));
    ```

## 2. Domain (Alan Adı) Satın Alma

İnsanların sitenize ulaşması için bir isme ihtiyacınız var (örn: `ilhanileosmanlica.com`).
*   **Nereden:** GoDaddy, Namecheap, Google Domains veya yerel sağlayıcılardan (Natro, İsimtescil vb.) alabilirsiniz.
*   **Maliyet:** Yıllık ortalama 10-15$.

## 3. Sunucu (Hosting) Seçimi

Uygulamanız hem Frontend hem Backend içerdiği için "Statik Hosting" (GitHub Pages, Netlify) **yeterli olmaz**. Bir sunucuya ihtiyacınız var.

### Seçenek A: Kolay Başlangıç (PaaS)
Bu servisler ayarları sizin yerinize yapar.
*   **Önerilenler:** [Render](https://render.com), [Railway](https://railway.app), [Heroku](https://heroku.com).
*   **Avantaj:** Kurulum çok basittir. GitHub hesabınızı bağlarsınız, "Deploy" dersiniz ve biter.
*   **Dezavantaj:** Ücretsiz planları kısıtlıdır, trafik arttıkça maliyet artabilir.

### Seçenek B: Tam Kontrol (VPS) - **Önerilen**
Kendi sanal bilgisayarınızı kiralarsınız.
*   **Önerilenler:** [DigitalOcean](https://digitalocean.com), [Hetzner](https://hetzner.com), [Linode](https://linode.com).
*   **Maliyet:** Aylık 4-5$ civarı.
*   **Avantaj:** En ucuz ve en esnek yöntemdir.
*   **Kurulum:** Ubuntu sunucu üzerine Node.js kurup projenizi kopyalarsınız.

## 4. Dosya Depolama (Önemli)

Şu an "Kaynaklar" bölümü için veritabanına sadece link (URL) ekliyoruz.
*   **Küçük Ölçek:** Dosyaları sunucuda bir klasöre (örn: `server/uploads`) yükleyip oradan sunabilirsiniz.
*   **Profesyonel Çözüm:** Dosyaları (PDF, Resim) **AWS S3**, **Cloudinary** veya **Firebase Storage** gibi bulut depolama alanlarına yükleyip, oradan aldığınız linki veritabanına kaydetmek en doğrusudur. Bu sayede sunucunuz yorulmaz.

## 5. Veritabanı (SQLite vs PostgreSQL)

*   **SQLite (Şu anki):** Dosya tabanlıdır (`database.sqlite`). Küçük ve orta ölçekli siteler için harikadır. Yedeklemesi kolaydır (dosyayı kopyalamanız yeterli). Başlangıç için **kesinlikle yeterli**.
*   **PostgreSQL:** Siteniz çok büyürse (binlerce anlık kullanıcı), ileride PostgreSQL'e geçiş yapabilirsiniz. Kod yapınız buna uygun.

## Özet Yol Haritası

1.  Bir **Domain** alın.
2.  Bir **VPS (Sanal Sunucu)** kiralayın (örn: Ubuntu 22.04).
3.  Sunucuya **Node.js** kurun.
4.  Projenizi sunucuya kopyalayın (Git ile).
5.  `npm install` ve `npm run build` komutlarını çalıştırın.
6.  Uygulamayı **PM2** (Process Manager) ile arka planda sürekli çalışır hale getirin.
7.  **Nginx** kurarak gelen trafiği uygulamanıza (Port 3001) yönlendirin ve SSL (HTTPS) sertifikası ekleyin (LetsEncrypt ile ücretsiz).

Bu altyapı ile uygulamanız profesyonel, hızlı ve güvenli bir web sitesi olarak yıllarca hizmet verebilir.
