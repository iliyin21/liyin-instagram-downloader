# Liyin — Instagram Media Downloader

Aplikasi web untuk mengunduh foto, video, reels, dan carousel dari Instagram
(konten publik), dengan tampilan premium bertema obsidian & champagne gold.

## Struktur Folder

```
instagram-downloader/
├── public/                  # Frontend statis (disajikan oleh Express)
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── assets/               # Taruh favicon / gambar tambahan di sini
├── routes/
│   └── download.js           # Endpoint API: /api/download, /api/fetch
├── utils/
│   ├── instagram.js          # Logika pengambilan data Instagram
│   └── validator.js          # Validasi & pembersihan URL
├── server.js                 # Entry point Express
├── package.json
├── railway.json               # Konfigurasi deploy Railway
├── .env.example
├── .gitignore
└── README.md
```

## Menjalankan di VSCode (lokal)

1. Buka folder `instagram-downloader` di VSCode.
2. Buka terminal (`` Ctrl+` ``), lalu install dependencies:
   ```bash
   npm install
   ```
3. Salin `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
4. Jalankan server:
   ```bash
   npm start
   ```
   Untuk mode auto-reload saat development (butuh `nodemon`, sudah ada di devDependencies):
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:3000` di browser.

## Cara Kerja

- Frontend (`public/`) mengirim link Instagram ke `POST /api/download`.
- `utils/instagram.js` mengambil data media publik dari link tersebut lewat
  paket `instagram-url-direct`.
- Hasilnya dinormalisasi (foto/video/carousel) lalu dikirim ke frontend
  sebagai JSON.
- Tombol "Unduh" pada tiap kartu media memanggil `GET /api/fetch`, yang
  mem-proxy file dari CDN Instagram dengan header `Content-Disposition`
  supaya browser langsung mengunduh dengan nama file yang rapi.

## Catatan Penting

- Hanya konten **publik** yang bisa diproses (post, reel, IGTV). Akun/post
  privat tidak didukung.
- Instagram sewaktu-waktu bisa mengubah struktur halaman mereka, yang dapat
  membuat proses ekstraksi gagal. Jika ini terjadi, perbarui paket
  `instagram-url-direct` (`npm update instagram-url-direct`) atau sesuaikan
  logika di `utils/instagram.js`.
- Ada rate limiting bawaan (`express-rate-limit`) di semua endpoint `/api`
  untuk mencegah penyalahgunaan — atur lewat `RATE_LIMIT_MAX` di `.env`.
- Hormati hak cipta dan privasi pemilik konten sebelum membagikan ulang
  media yang diunduh.

## Deploy ke Railway

1. Push project ini ke repository GitHub.
2. Di [Railway](https://railway.app), buat **New Project → Deploy from GitHub repo**
   dan pilih repo ini.
3. Railway otomatis mendeteksi Node.js lewat Nixpacks dan menjalankan
   `npm install` lalu `npm start` (lihat `railway.json`).
4. Set environment variable di tab **Variables** Railway bila perlu
   (mis. `RATE_LIMIT_MAX`). Variabel `PORT` sudah otomatis disediakan Railway.
5. Setelah deploy selesai, buka domain yang diberikan Railway
   (`xxxx.up.railway.app`) — aplikasi sudah live.

### Deploy lewat Railway CLI (opsional)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## Tech Stack

- **Backend:** Node.js, Express, axios, instagram-url-direct
- **Keamanan:** helmet, express-rate-limit, cors
- **Frontend:** HTML/CSS/JS murni (tanpa framework), font Fraunces + Manrope + IBM Plex Mono
- **Deploy:** Railway (Nixpacks)
