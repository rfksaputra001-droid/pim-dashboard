# pim-dashboard

Frontend untuk sistem kas Karang Taruna RT 22/06. Dibangun dengan React + Vite + Tailwind CSS.

## Tech Stack

- **React 18** + **Vite 8** (rolldown)
- **React Router v6**
- **Tailwind CSS v3**
- **Recharts** — grafik donasi
- **@iconify/react** — Solar icon set

## Prasyarat

- Node.js 18+
- `pim-api` sudah berjalan di port `3002`

## Setup

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend berjalan di `http://localhost:5173`. Request ke `/api/*` otomatis di-proxy ke `http://localhost:3002`.

## Build Production

```bash
npm run build
```

Output di folder `dist/`.

## Struktur Project

```
pim-dashboard/
└── src/
    ├── pages/
    │   ├── Dashboard.jsx          # Halaman publik utama
    │   ├── FormIuran.jsx          # Form submit donasi (multi-step)
    │   ├── Pengeluaran.jsx        # Riwayat pengeluaran (publik)
    │   ├── AdminLogin.jsx         # Login admin
    │   ├── AdminIuran.jsx         # Manajemen donasi
    │   ├── AdminPengeluaran.jsx   # Manajemen pengeluaran
    │   └── AdminKelolaPengguna.jsx # Kelola akun admin (SUPER_ADMIN)
    ├── components/
    │   ├── AdminLayout.jsx        # Layout admin dengan sidebar
    │   ├── AdminSidebar.jsx       # Sidebar navigasi admin
    │   ├── Navbar.jsx
    │   └── ProtectedRoute.jsx     # Guard route admin
    ├── contexts/
    │   └── AuthContext.jsx        # State autentikasi global
    ├── utils/
    │   ├── api.js                 # Fetch helper (auth header, base URL)
    │   ├── format.js              # Format rupiah, tanggal, label
    │   └── imageCompressor.js     # Kompresi gambar sebelum upload
    └── assets/
        └── QRIS.png               # QR code pembayaran QRIS
```

## Halaman

| Path | Akses | Deskripsi |
|------|-------|-----------|
| `/` | Publik | Dashboard: total kas, leaderboard donatur |
| `/setor` | Publik | Form donasi multi-step (QRIS / transfer bank) |
| `/pengeluaran` | Publik | Riwayat pengeluaran + foto nota |
| `/admin/login` | Publik | Login admin |
| `/admin/iuran` | Admin | Verifikasi donasi masuk |
| `/admin/pengeluaran` | Admin | Catat pengeluaran + upload nota |
| `/admin/pengguna` | Super Admin | Kelola akun admin |

## Environment

Vite proxy sudah dikonfigurasi di `vite.config.js` — tidak perlu setup tambahan selama `pim-api` berjalan di port `3002`.
