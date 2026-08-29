# Nexora Web — Build Skill (React)

Proyek React ini dibangun mengikuti spesifikasi visual otoritatif di
`.agents/skills/nexora-web/SKILL.md` (dari desain Figma/mockup). Baca kedua
dokumen sebelum mengubah tampilan agar konsisten.

## Stack
- Vite + React 18 + react-router-dom (HashRouter)
- CSS murni, CSS custom properties untuk semua token warna (di `src/index.css` `:root`)
- Font: Playfair Display (heading) & Inter (body) — diimpor via Google Fonts
  di `index.html`

## Struktur Proyek
```
src/
├── App.jsx                 # Definisi semua route (HashRouter)
├── index.css               # Design system + style semua halaman
├── main.jsx
├── components/             # Navbar, Footer, CtaButton, HeroArt, Star, NotificationPanel
├── hooks/                  # useScrollReveal (IntersectionObserver)
├── lib/                    # jobsData, profile, savedJobs
└── pages/                  # Satu file per halaman/route
```

## Aturan yang WAJIB diikuti
1. **Jangan menyimpang dari token warna.** Semua warna dipakai lewat variabel
   CSS (`var(--bg-primary)`, `var(--accent-orange)`, dst).
2. **Semua permukaan plum** memakai
   `--bg-gradient: linear-gradient(180deg, #42154c, #632248)`. Jangan pakai
   `--bg-card` solid sebagai background; pakai token `--bg-gradient`.
   `--bg-card-alt` (#3D1028) dipakai untuk panel aksen (sidebar employer,
   dropdown notifikasi, footer).
3. **Navbar konsisten di semua halaman** (`src/components/Navbar.jsx`),
   background-nya `--bg-gradient` (landing: `--gradient-navbar`). Ada state
   `navbar--scrolled` yang aktif saat scrollY > 50.
4. **Aset dari `public/`**: `logo-nexora.webp` & `for-employer.png` — pakai file
   asli, bukan placeholder.
5. **Halaman baru** = tambah route di `src/App.jsx`, buat file di `src/pages/`,
   gunakan komponen bersama (Navbar, Footer, CtaButton, HeroArt, Star).
6. **Ilustrasi dekoratif** `src/components/HeroArt.jsx` menampilkan logo Nexora
   (`/logo-nexora.webp`) sebagai elemen TUNGGAL berukuran **767×633**. Elemen
   lain (gunung/segitiga, awan, bintang) tidak dipakai. Semua pemakaian HeroArt
   di halaman harus berukuran 767×633.
7. **Persistence via localStorage**:
   - Profil: key `nexora_profile_v1` — lihat `src/lib/profile.js`
   - Job tersimpan (bookmark): key `nexora_saved_jobs_v1` — lihat `src/lib/savedJobs.js`
   - Data job dummy dipakai bersama di `src/lib/jobsData.js` (JobDiscovery,
     JobDetail, SavedJobs, EmployerDashboard)
8. **Animasi**: tambahkan class `.scroll-reveal` + gunakan hook
   `src/hooks/useScrollReveal.js` (IntersectionObserver, stagger via
   `data-delay`). `.page__body` sudah punya efek `fadeInUp`.
9. **Chart Profile** berupa SVG inline di `src/pages/ProfilePage.jsx`.
10. **CV Generator** (`/cv`) memakai `window.print()` + `@media print` — hanya
    elemen `#cv-sheet` yang tampil saat dicetak.

## Peta halaman (routes)
| Route            | File                            | Deskripsi                                      |
| :--------------- | :------------------------------ | :--------------------------------------------- |
| `/`              | `pages/HomePage.jsx`            | Dashboard (Profil, Pending, Discover)          |
| `/welcome`       | `pages/LandingPage.jsx`         | Landing / marketing page                       |
| `/signup`        | `pages/SignUpPage.jsx`          | Role selection + form worker/employer          |
| `/login`         | `pages/LoginPage.jsx`           | Login worker (bg gradient plum-magenta)        |
| `/jobs`          | `pages/JobDiscoveryPage.jsx`    | Cari kerja + filter (type, mode, salary, industry, duration, deadline) |
| `/jobs/:id`      | `pages/JobDetailPage.jsx`       | Detail job + match breakdown + modal Easy Apply|
| `/profile`       | `pages/ProfilePage.jsx`         | Profile editable (localStorage) + activity chart |
| `/cv`            | `pages/CVGeneratorPage.jsx`     | CV generator (3 template, download via print)  |
| `/saved`         | `pages/SavedJobsPage.jsx`       | Job tersimpan (sinkron bookmark localStorage)  |
| `/applications`  | `pages/ApplicationsPage.jsx`    | Tracker lamaran (tabs status + timeline)       |
| `/employer`      | `pages/EmployerDashboardPage.jsx`| Dashboard employer (sidebar: Dashboard / My Jobs / Candidates) |
| `*`              | `Navigate to /`                 | Fallback ke dashboard                          |

## Menjalankan
- Dev: `npm run dev` (buka `http://localhost:5173`)
- Build: `npm run build`
- Preview: `npm run preview`