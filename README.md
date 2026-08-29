# Nexora — Job Platform UI

Landing page dan UI job platform Nexora. Dibangun dengan **Vite + React** dan mengikuti desain di `.agents/skills/nexora-web/SKILL.md`.

## Fitur

- Landing page & halaman-halaman UI (Home, Job Discovery, Job Detail, Sign Up, Login, Profile, CV Generator, Employer Dashboard, dsb.)
- Routing dengan React Router

## Tech Stack

- [Vite](https://vitejs.dev/) 6
- [React](https://react.dev/) 18
- [React Router](https://reactrouter.com/) 6

## Cara Menjalankan

```bash
npm install     # install dependencies
npm run dev     # jalankan dev server di http://localhost:5173
```

Build produksi:

```bash
npm run build   # hasil build di folder dist/
npm run preview # pratinjau build lokal
```

## Deploy ke GitHub Pages (manual)

1. Buat repo baru di GitHub (misal `nexora-web`).
2. Push source code ke repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
3. Build hasil produksi:
   ```bash
   npm run build
   ```
4. Buat cabang `gh-pages` dari folder `dist` lalu push:
   ```bash
   git add dist -f
   git commit -m "Deploy build"
   git subtree push --prefix dist origin gh-pages
   ```
   > Catatan: karena `dist` ada di `.gitignore`, gunakan `-f` kalau ingin memakainya di commit, atau pakai `git subtree push --prefix dist`.

5. Di repo GitHub: **Settings → Pages → Branch** pilih `gh-pages`, folder `/(root)`, lalu **Save**.

Situs akan live di `https://<username>.github.io/<repo>/`.

> Jika halaman dipublish bukan di root domain (ada prefix repo, contoh di atas), pastikan `base` di `vite.config.js` disesuaikan, misal `base: "/<repo>/"`, lalu build ulang.
