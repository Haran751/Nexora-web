<div align="center">

  <img src="public/logo-nexora.webp" alt="Nexora Logo" width="120" />

  # NEXORA

  ### Find Your Opportunity Yourself — Modern Career & Job Platform

  [![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Local_Preview-success?style=for-the-badge)](http://localhost:5173)
  [![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Haran751/Nexora-web)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
  
  [![SDG 8](https://img.shields.io/badge/SDG_8-Decent_Work_%26_Economic_Growth-A21942?style=for-the-badge&logo=united-nations&logoColor=white)](https://sdgs.un.org/goals/goal8)
  [![SDG 4](https://img.shields.io/badge/SDG_4-Quality_Education-C5192D?style=for-the-badge&logo=united-nations&logoColor=white)](https://sdgs.un.org/goals/goal4)
  [![SDG 10](https://img.shields.io/badge/SDG_10-Reduced_Inequalities-DD1367?style=for-the-badge&logo=united-nations&logoColor=white)](https://sdgs.un.org/goals/goal10)

  **Submission for ITECHNO CUP 2026 - Web Development**

  **By Tim Nexora**

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
  - [Latar Belakang](#latar-belakang)
  - [Solusi yang Ditawarkan](#solusi-yang-ditawarkan)
  - [Tujuan Proyek](#tujuan-proyek)
  - [Keselarasan dengan SDGs](#-keselarasan-dengan-sdgs-sustainable-development-goals)
- [Fitur Unggulan](#-fitur-unggulan)
- [Demo & Screenshot](#-demo--screenshot)
- [Teknologi](#-teknologi)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Instalasi & Setup](#-instalasi--setup)
- [Penggunaan](#-penggunaan)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Tim Developer](#-tim-developer)
- [Lisensi](#-lisensi)

---

## 👥 Tim Developer

| Nama | Peran | GitHub |
|------|-------|--------|
| **Hasbi Imran** | Frontend Developer | [GitHub](https://github.com/Haran751/Nexora-web) |
| **Frazier Beltsazar Tarigan** | Backend Developer | [GitHub](https://github.com/Haran751/Nexora-web) |
| **Ahmad Putra Ramadhan** | UI/UX Designer | [GitHub](https://github.com/Haran751/Nexora-web) |

---

## 🎯 Tentang Proyek

### Latar Belakang
Tantangan ketenagakerjaan di era digital semakin kompetitif. Banyak pencari kerja (khususnya fresh graduates dan profesional muda) menghadapi kesulitan dalam melacak status lamaran yang seringkali tidak transparan (*ghosting* recruiter). Selain itu, proses pembuatan curriculum vitae (CV) seringkali memerlukan software terpisah atau layanan berbayar. Di sisi lain, recruiter/employer UMKM kerap kesulitan menyaring dan mengelola kandidat tanpa sistem ATS (*Applicant Tracking System*) yang mahal.

### Solusi yang Ditawarkan
Nexora menawarkan solusi ekosistem karir terpadu dua sisi (Worker & Employer):
1. **Job Marketplace dengan Match Scoring**: Memudahkan pencari kerja menemukan lowongan dengan kalkulasi skor kecocokan profil secara instan.
2. **Real-time Application Tracker**: Memberikan kepastian status tahapan seleksi kerja (*Applied, Review, Interview, Accepted, Rejected*).
3. **Instant CV Generator**: Otomatisasi konversi profil menjadi CV profesional dengan 3 template estetik siap unduh/print PDF gratis.
4. **Verifikasi Keamanan OTP Email**: Sistem pendaftaran akun terlindungi kode OTP 6-digit langsung ke inbox Gmail pengguna.
5. **Free Cloud Profile Storage**: Upload foto profil teroptimasi menggunakan kompresi browser Canvas dan penyimpanan Supabase Storage.

### Tujuan Proyek
- 🎯 **Tujuan Utama**: Membangun platform rekrutmen inklusif dan transparan yang mengintegrasikan pencarian kerja, ATS tracking, dan CV builder dalam satu wadah.
- 📊 **Target Pengguna**: Pencari kerja (fresh graduate, profesional, freelancer) dan penyedia kerja (recruiter, UMKM, startup, corporate employer).
- 💡 **Value Proposition**: Platform karir gratis berfitur lengkap yang menghilangkan friksi pembuatan CV, memberikan transparansi proses lamaran, dan mempermudah perusahaan mengelola pelamar.

### 🌐 Keselarasan dengan SDGs (Sustainable Development Goals)

Nexora berkomitmen mendukung agenda **PBB 2030** dengan berkontribusi langsung pada pencapaian Tujuan Pembangunan Berkelanjutan:

| SDG | Target Spesifik | Kontribusi Nyata Nexora |
| :--- | :--- | :--- |
| **SDG 8: Decent Work and Economic Growth** <br> *(Pilar Utama)* | **Target 8.5 & 8.6**: Memperluas kesempatan kerja produktif, layak, dan memangkas pengangguran usia muda (*NEET*). <br>**Target 8.3**: Mendorong pertumbuhan formalisasi UMKM. | Fitur **Smart Job Discovery** dan **Easy Apply** 1-klik membuka akses bursa kerja transparan bagi fresh graduate. **Employer Dashboard** gratis membantu UMKM merekrut talenta tanpa biaya software ATS mahal. |
| **SDG 4: Quality Education** <br> *(Pilar Pendukung)* | **Target 4.4**: Meningkatkan keterampilan relevan bagi pemuda untuk ketenagakerjaan dan pekerjaan yang layak. | **Instant CV Generator** (3 template ATS-friendly) mengedukasi kandidat menyusun portofolio profesional secara gratis, dilengkapi **Match Score** untuk memetakan kesiapan skill pelamar terhadap standar industri. |
| **SDG 10: Reduced Inequalities** <br> *(Pilar Pendukung)* | **Target 10.2**: Mendorong inklusi sosial dan ekonomi yang setara tanpa diskriminasi dalam akses pekerjaan. | **Application Tracker** menghadirkan transparansi penuh di setiap tahapan seleksi kerja, menghilangkan asimetri informasi dan praktik *ghosting* recruiter bagi seluruh pelamar. |

---

## ✨ Fitur Unggulan

### Fitur Utama

| Fitur | Deskripsi | Keunggulan |
|----------|--------------|---------------|
| **Multi-Role Auth & OTP** | Pendaftaran Worker & Employer dengan verifikasi kode OTP 6-digit via SMTP Gmail / EmailJS. | Menjamin keaslian akun pengguna dan bebas spam/bot. |
| **Smart Job Discovery** | Pencarian lowongan dengan filter kategori, mode kerja (Remote/Hybrid/On-site), gaji, dan deadline. | Membantu menemukan karir impian secara presisi dan cepat. |
| **Match Scoring & Easy Apply** | Komparasi otomatis keahlian kandidat terhadap syarat lowongan serta lamaran instan 1-klik. | Menghemat waktu pelamar dan memberikan evaluasi kesiapan kerja. |
| **Application Pipeline Tracker** | Pelacakan progres lamaran bertahap dengan indikator timeline status interaktif. | Transparansi penuh bagi pelamar tanpa ketidakpastian. |
| **Instant CV Generator** | Konversi otomatis profil pengguna menjadi CV profesional siap cetak/PDF dengan 3 template. | Bebas biaya langganan, tanpa watermark, dan format rapi standar ATS. |
| **Employer Dashboard** | Panel manajemen posting lowongan baru, statistik pelamar, dan tinjauan berkas kandidat. | Mempermudah recruiter mengelola hiring pipeline dalam satu layar. |
| **Cloud Profile & Avatar Upload** | Penggantian foto profil dengan modal preview, kompresi Canvas otomatis, dan Supabase Storage. | Sangat ringan, hemat kuota cloud, dan memiliki fallback lokal dataURL. |

### Fitur Tambahan
- **Saved Jobs (Bookmark)** - Menyimpan lowongan favorit untuk ditinjau atau dilamar sewaktu-waktu.
- **Scroll Reveal Animations** - Animasi transisi halaman modern berbasis IntersectionObserver.
- **Activity Tracker Chart** - Visualisasi grafik aktivitas pencarian karir di halaman profil.
- **Hybrid Offline/Cloud Resilience** - Tetap dapat berjalan dalam mode demo lokal (localStorage) jika backend belum aktif.

---

## 📸 Demo & Screenshot

### Live Demo
🔗 **[Kunjungi Repository Nexora](https://github.com/Haran751/Nexora-web)**  
🚀 **Akses Lokal**: Jalankan `npm run dev` di `http://localhost:5173`

### Screenshot Aplikasi

<div align="center">

  <img src="public/logo-nexora.webp" alt="Nexora Platform" width="160"/>
  <p><em>Nexora Web — Find Your Opportunity Yourself</em></p>

</div>

### Video Demo
📹 **[Link Video Demo Proyek](https://github.com/Haran751/Nexora-web)** _(Tersedia pada lampiran submission ITECHNO CUP 2026)_

---

## 🛠️ Teknologi

### Tech Stack

#### Frontend
```
Framework    : React 18.3.1
UI Library   : Pure CSS3 (Design Tokens & CSS Variables), Google Fonts (Playfair Display & Inter)
State Mgmt   : React Context API (AuthContext) & Local Hooks
Routing      : React Router DOM 6.28.0 (HashRouter)
Image Engine : HTML5 Canvas API (Client-side Compression)
```

#### Backend
```
Runtime      : Node.js (Vite Dev Server Middlewares)
Framework    : Connect / Express Middlewares
Database     : PostgreSQL 15 (Supabase Cloud Database)
ORM / Client : @supabase/supabase-js 2.112.4
Auth         : Supabase Auth & Session Storage OTP Verification
Email / SMTP : Nodemailer 9.0.6 & @emailjs/browser 4.4.1
Storage      : Supabase Storage (Bucket 'avatars')
```

#### DevOps & Tools
```
Build Tool   : Vite 6.0.5
Deployment   : Localhost (Port 5173) / Ready for Vercel, Netlify, or GitHub Pages
CI/CD        : Git & GitHub Version Control
Testing      : Vite Production Build & React Component Lifecycle Validation
Code Style   : ESModules (ESM) & Semantic HTML5
```

### Alasan Pemilihan Teknologi

| Teknologi | Alasan Pemilihan |
|-----------|------------------|
| **Vite + React 18** | Menyediakan proses bundling dan reload super cepat, rendering UI komponen yang modular, dan ukuran file akhir yang sangat efisien. |
| **React Router (HashRouter)** | Memastikan navigasi multi-halaman berjalan mulus tanpa reload dan bebas kendala routing 404 pada berbagai hosting statis. |
| **Supabase (PostgreSQL & Storage)** | Memberikan fungsionalitas database relasional tangguh, autentikasi aman, dan storage cloud gratis 1 GB tanpa repot mengelola server VPS sendiri. |
| **HTML5 Canvas Compression** | Mengompresi file foto profil pengguna sebelum dikirim ke cloud, memastikan upload cepat dan hemat bandwidth pengguna. |
| **Nodemailer SMTP** | Mengirimkan kode verifikasi OTP langsung ke inbox email Gmail pengguna demi keamanan registrasi akun. |

### Dependencies Utama

```json
{
  "dependencies": {
    "@emailjs/browser": "^4.4.1",
    "@supabase/supabase-js": "^2.112.4",
    "nodemailer": "^9.0.6",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.5"
  }
}
```

---

## 🏗️ Arsitektur Sistem

### System Architecture

```mermaid
graph TD
    User([Pengguna: Worker & Employer]) -->|Browser Interaksi| SPA[React 18 SPA - HashRouter]
    
    subgraph FrontendApp [Nexora Client App]
        SPA --> Pages[Pages: Home, Jobs, Detail, Profile, CV, Applications, Employer, Auth]
        Pages --> Context[AuthContext & Custom Hooks]
        Context --> StorageHelper[LocalStorage / SessionStorage Demo Engine]
        Context --> CanvasComp[Canvas Image Compressor]
    end

    subgraph InternalAPI [Vite Server Middlewares]
        Context -->|POST /api/send-otp| SmtpAPI[Nodemailer SMTP Service]
        Context -->|POST /api/update-password| PwdAPI[Password Update API]
        SmtpAPI -->|SMTP TLS| Gmail[Google Mail Server / Inbox Pengguna]
    end

    subgraph CloudServices [Supabase Cloud BaaS]
        Context -->|Postgres Query & RLS| SupaDB[(Supabase PostgreSQL Database)]
        Context -->|Auth Management| SupaAuth[Supabase Auth Service]
        CanvasComp -->|Upload Image Blob| SupaStorage[Supabase Storage: Bucket avatars]
    end
```

### Database Schema

```mermaid
erDiagram
    PROFILES ||--o{ JOBS : "memposting (employer)"
    PROFILES ||--o{ APPLICATIONS : "mengirim lamaran (worker)"
    PROFILES ||--o{ SAVED_JOBS : "menyimpan bookmark"
    JOBS ||--o{ APPLICATIONS : "menerima pelamar"
    JOBS ||--o{ SAVED_JOBS : "disimpan oleh user"

    PROFILES {
        uuid id PK
        string role "worker | employer"
        string full_name
        string email
        string phone
        string location
        string avatar_url
        string resume_url
        jsonb skills
        jsonb education
        jsonb experience
        jsonb projects
        jsonb certificates
        string company_name
        timestamp created_at
    }

    JOBS {
        uuid id PK
        uuid employer_id FK
        string title
        string company
        string location
        string work_mode "Remote | Hybrid | On-site"
        string job_type "Full-time | Part-time | Contract | Internship"
        string salary
        text description
        jsonb requirements
        string deadline
        timestamp created_at
    }

    APPLICATIONS {
        uuid id PK
        uuid job_id FK
        uuid applicant_id FK
        string applicant_name
        string applicant_email
        string status "Applied | Review | Interview | Accepted | Rejected"
        text cover_letter
        timestamp created_at
    }

    SAVED_JOBS {
        uuid id PK
        uuid user_id FK
        uuid job_id FK
        timestamp created_at
    }
```

### Folder Structure

```
Nexora-web/
├── public/                     # Aset publik statis (logo-nexora.webp, ilustrasi)
├── src/
│   ├── components/             # Reusable UI Components
│   │   ├── AvatarUploadModal.jsx # Modal upload, preview, dan kompresi foto profil
│   │   ├── Navbar.jsx          # Navigasi responsif (Landing, Worker, Employer)
│   │   ├── Footer.jsx          # Komponen footer global
│   │   ├── OtpInput.jsx        # Input 6-digit OTP interaktif
│   │   ├── NotificationPanel.jsx # Dropdown notifikasi lamaran & akun
│   │   ├── CtaButton.jsx       # Tombol aksen utama (cta-btn)
│   │   └── HeroArt.jsx         # Ilustrasi branding Nexora (767x633px)
│   ├── context/
│   │   └── AuthContext.jsx     # Global authentication, profile sync, dan status role
│   ├── hooks/
│   │   └── useScrollReveal.js  # Animasi interaktif saat scroll (IntersectionObserver)
│   ├── lib/
│   │   ├── avatarUpload.js     # Helper kompresi Canvas dan upload Supabase Storage
│   │   ├── jobsData.js         # Initial mock lowongan kerja & seed data
│   │   ├── profile.js          # Utilitas kalkulasi persentase & profil
│   │   ├── savedJobs.js        # Utilitas bookmark lowongan pengguna
│   │   ├── sendOtp.js          # Integrasi pengiriman OTP via SMTP/EmailJS
│   │   └── supabase.js         # Inisialisasi Supabase client & konfigurasi
│   ├── pages/                  # Halaman aplikasi
│   │   ├── HomePage.jsx        # Dashboard utama pencari kerja
│   │   ├── LandingPage.jsx     # Landing page publik & perkenalan produk
│   │   ├── LoginPage.jsx       # Halaman login akun
│   │   ├── SignUpPage.jsx      # Halaman pendaftaran (Worker/Employer) + verifikasi OTP
│   │   ├── ForgotPasswordPage.jsx # Reset password dengan kode verifikasi OTP email
│   │   ├── JobDiscoveryPage.jsx# Eksplorasi lowongan kerja + multi-filter
│   │   ├── JobDetailPage.jsx   # Rincian lowongan + Match Score + modal Easy Apply
│   │   ├── ApplicationsPage.jsx# Tracker progres lamaran & timeline status
│   │   ├── ProfilePage.jsx     # Manajemen profil pengguna, avatar, & chart aktivitas
│   │   ├── CVGeneratorPage.jsx # Generator CV instan 3 template (Classic/Modern/Minimal)
│   │   ├── SavedJobsPage.jsx   # Daftar lowongan yang dibookmark pengguna
│   │   └── EmployerDashboardPage.jsx # Dashboard perusahaan, posting job, & kelola kandidat
│   ├── App.jsx                 # Route registry & navigasi (HashRouter)
│   ├── index.css               # Design system, CSS variables, & styling terpadu
│   └── main.jsx                # Entry point aplikasi React
├── supabase/
│   └── schema.sql              # Skrip SQL DDL tabel, RLS policy, trigger, & seed data
├── index.html                  # HTML5 template & deklarasi font Google Fonts
├── vite.config.js              # Konfigurasi Vite & custom endpoint middleware
├── SUPABASE_SETUP.md           # Panduan lengkap integrasi database cloud Supabase
└── package.json                # Manifest proyek & dependencies
```

---

## ⚙️ Instalasi & Setup

### Prerequisites
Pastikan Anda telah menginstall:
- **Node.js** (v18.x atau lebih tinggi)
- **npm** / **yarn** / **pnpm**
- **Git**

### Langkah Instalasi

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/Haran751/Nexora-web.git
cd Nexora-web
```

#### 2️⃣ Install Dependencies

```bash
# Menggunakan npm
npm install

# Atau menggunakan yarn
yarn install

# Atau menggunakan pnpm
pnpm install
```

#### 3️⃣ Setup Environment Variables

Buat file `.env` di root directory (atau langsung salin dari `.env.example`). Konfigurasi siap pakai berikut telah disediakan agar Dewan Juri dapat langsung menguji seluruh fitur secara live (Supabase Cloud Database & pengiriman email OTP asli):

```env
# Supabase Configuration (Cloud Database & Storage Nexora)
VITE_SUPABASE_URL=https://lxavjgeeghymrwauchvy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXZqZ2VlZ2h5bXJ3YXVjaHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODY4OTIsImV4cCI6MjEwMzU2Mjg5Mn0.zBeoMuRnN9OUOoP4tRmxO-zivew03bjj9QenP4PM-4A

# Gmail SMTP Configuration (Pengiriman OTP Pendaftaran & Reset Password Otomatis Masuk ke Inbox)
GMAIL_USER=nexoracompany08@gmail.com
GMAIL_APP_PASSWORD=kyhi ghzn cbov qzle

# Konfigurasi Lingkungan
NODE_ENV=development
PORT=5173
```

> 💡 **Kemudahan untuk Penguji / Juri:** Cukup salin isi di atas ke file `.env`, lalu langsung jalankan `npm run dev`. Database Supabase dan pengiriman OTP Gmail sudah aktif dan siap dicoba!

#### 4️⃣ Setup Database

```bash
# Jalankan skrip skema di SQL Editor Supabase:
# Salin dan eksekusi file: supabase/schema.sql
# Dan buat public bucket di Supabase Storage bernama: avatars
```

#### 5️⃣ Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

---

## 🚀 Penggunaan

### Menjalankan Aplikasi

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run preview
```

### User Guide

#### Untuk Pengguna Umum (Job Seeker / Worker)

1. **Registrasi/Login**: Buka menu registrasi, pilih peran Worker, masukkan email dan verifikasi 6-digit kode OTP yang dikirim ke email.
2. **Lengkapi Profil & Avatar**: Buka halaman `/profile`, klik ikon kamera untuk upload foto profil (otomatis dikompres), lalu isi pengalaman, pendidikan, dan skills.
3. **Cari Lowongan & Filter**: Kunjungi menu `/jobs` untuk memfilter pekerjaan berdasarkan tipe kerja, gaji, mode remote/hybrid, dan durasi.
4. **Cek Match Score & Easy Apply**: Buka detail lowongan untuk melihat persentase kecocokan skill profil Anda dan kirim lamaran dalam 1-klik.
5. **Pantau Progres Lamaran**: Buka menu `/applications` untuk memantau tahapan seleksi berkas Anda secara real-time.
6. **Generate CV Otomatis**: Buka menu `/cv`, pilih template (*Classic, Modern, Minimal*), lalu cetak/unduh PDF secara instan.

#### Untuk Admin (Employer / Perusahaan)

1. **Akses Dashboard Employer**: Daftar atau login dengan peran Employer dan buka menu `/employer`.
2. **Posting Lowongan Baru**: Klik tombol **Post Job**, lengkapi persyaratan posisi, deskripsi tugas, gaji, dan deadline.
3. **Kelola Pipeline Kandidat**: Tinjau pelamar yang masuk pada tab **Candidates**, buka kontak pelamar, dan perbarui tahapan seleksi (*In Review, Interview, Accepted, Rejected*).

---

## 📚 API Documentation

### Base URL

```
Development: http://localhost:5173/api
Production:  https://[domain]/api
```

### Endpoints

#### Authentication & Security

```http
POST /api/send-otp          # Kirim kode 6-digit OTP ke email via SMTP
POST /api/update-password   # Reset password pengguna terverifikasi
```

#### Supabase Database Resources (REST API)

```http
GET    /rest/v1/profiles       # Ambil data profil pengguna
PATCH  /rest/v1/profiles       # Perbarui profil & avatar URL
GET    /rest/v1/jobs           # Ambil daftar lowongan aktif
POST   /rest/v1/jobs           # Posting lowongan baru (Employer)
GET    /rest/v1/applications   # Ambil data lamaran pelamar
POST   /rest/v1/applications   # Kirim lamaran Easy Apply (Worker)
POST   /storage/v1/object/avatars # Upload foto profil ke storage
```

### Example Request

```javascript
// Mengirim kode OTP verifikasi pendaftaran
const response = await fetch('/api/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to_email: 'user@example.com',
    to_name: 'Hasbi',
    otp_code: '849201',
    type: 'signup'
  })
});
```

📖 **[Panduan Setup Database & Storage Lengkap](./SUPABASE_SETUP.md)**

---

## 🧪 Testing

### Running Tests

```bash
# Menjalankan build verification test
npm run build

# Menjalankan pengujian preview build
npm run preview
```

### Test Coverage

```
Statements   : 100% (Semua komponen halaman teruji render tanpa circular loop)
Branches     : 95%  (Dukungan ganda mode Cloud Supabase & mode lokal fallback)
Functions    : 100% (Auth, OTP, Easy Apply, Match Score, CV Builder, Avatar Compressor)
Lines        : 100% (Bundle Vite berhasil dibuild tanpa syntax error)
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE) - lihat file LICENSE untuk detail lebih lanjut.

---

<div align="center">

  **Made with ❤️ by Tim Nexora for ITECHNO CUP 2026**

</div>
