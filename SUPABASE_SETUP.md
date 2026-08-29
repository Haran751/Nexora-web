# Panduan Menghubungkan Supabase ke Nexora Web

Nexora Web kini sudah siap 100% mendukung backend **Supabase** secara dinamis (Auth, Database PostgreSQL, RLS, dan Storage).

Saat ini, jika belum memasukkan URL dan Key Supabase, aplikasi secara otomatis berjalan dalam mode **demo fallback** yang aman (data tersimpan di browser via localStorage) sehingga fitur tetap dapat langsung diuji.

---

## Langkah-langkah Menghubungkan Supabase:

### 1. Buat Project di Supabase
1. Buka [https://supabase.com](https://supabase.com) dan login/daftar akun gratis.
2. Klik **"New Project"**.
3. Isi:
   - **Name**: `nexora-web` (atau nama pilihan Anda)
   - **Database Password**: Buat password yang kuat (simpan baik-baik)
   - **Region**: Pilih yang terdekat (misal: *Singapore*)
4. Tunggu beberapa saat sampai project selesai dibuat.

---

### 2. Jalankan Skema Database (Tabel, Relasi & RLS)
1. Di dashboard Supabase project Anda, buka menu **SQL Editor** di sidebar kiri (ikon terminal/query).
2. Buka file [`supabase/schema.sql`](./supabase/schema.sql) di project Nexora Web ini, lalu salin (copy) seluruh isinya.
3. Tempel (paste) ke dalam **SQL Editor** Supabase.
4. Klik tombol **"Run"** (atau tekan `Ctrl + Enter`).
5. Selesai! Tabel-tabel berikut otomatis dibuat dengan Row Level Security (RLS) terpasang:
   - `profiles`: profil pencari kerja & perusahaan
   - `jobs`: lowongan kerja aktif
   - `applications`: pelamar dan progres tahapan rekrutmen
   - `saved_jobs`: bookmark lowongan pengguna
   - Trigger otomatis `handle_new_user` saat user sign up.
   - Seed data lowongan awal.

---

### 3. Ambil API Keys
1. Di dashboard Supabase, klik ikon **Settings** (gear) di pojok kiri bawah -> pilih **API**.
2. Salin nilai dari:
   - **Project URL** (misal: `https://xyzcompany.supabase.co`)
   - **Project API Keys** -> bagian **`anon` `public`** (key panjang berawalan `eyJ...`)

---

### 4. Masukkan ke File `.env`
Buka file `.env` di root folder proyek ini:
```env
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 5. Jalankan Aplikasi
Jalankan dev server:
```bash
npm run dev
```

---

### 6. Setup Supabase Storage (Foto Profil / Avatars) — Gratis
Agar upload foto profil tersimpan di cloud Supabase Storage (kuota gratis 1 GB):
1. Buka dashboard Supabase -> pilih menu **Storage** di sidebar kiri.
2. Klik **"New Bucket"**.
3. Beri nama: `avatars`.
4. Centang **"Public bucket"** (agar foto profil bisa diakses untuk ditampilkan di web).
5. Klik **"Save"**.
*(Catatan: Jika bucket belum dibuat atau aplikasi dijalankan tanpa Supabase, sistem secara otomatis beralih ke mode kompresi lokal Base64 sehingga foto profil tetap berfungsi 100%).*

Aplikasi Nexora kini telah terhubung penuh ke cloud database Supabase!
- User baru bisa **Sign Up** sebagai Worker atau Employer.
- Mengunggah & mengganti foto profil dengan preview dan kompresi otomatis.
- Employer dapat memposting lowongan baru dan mengelola pelamar.
- Worker dapat mencari lowongan, bookmark, apply (Easy Apply), dan memantau status lamaran secara real-time.
