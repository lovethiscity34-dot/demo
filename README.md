# Horus Super Win 1000 — Final Demo Build

Browser demo slot virtual bertema Horus, siap di-host sebagai static site di GitHub Pages.

## Struktur
- `index.html` — UI
- `css/core.css` — responsive desktop/mobile styling
- `js/` — state machine, reel/tumble, RNG, bet/credit, scatter, multiplier, audio, Horus controller
- `assets/horus/` — character pose assets terpisah (SVG)
- `assets/symbols/` — symbol assets terpisah (SVG)
- `assets/backgrounds/` — normal/scatter/ultimate backgrounds
- `assets/effects/` — FX assets
- `audio/` — MP3 + WAV fallback assets

## GitHub Pages
Upload **seluruh isi ZIP**, bukan hanya `index.html`. Pastikan struktur folder tidak berubah. Semua path menggunakan relative URL sehingga dapat berjalan di root maupun subpath GitHub Pages.

## Gameplay
- Demo credit: Rp100.000
- Reset otomatis bila saldo < Rp10.000
- Bet: Rp100–Rp4.000 per Rp100, lalu Rp5.000, Rp10.000, kemudian ×2
- Normal: RNG lebih ketat, 8+ simbol identik untuk win
- Tumble/refill maksimal 12 ronde per spin
- 4+ Scatter memicu Free Spin
- Scatter: Horus Ultimate + multiplier independen x1–x1000
- Turbo dan Auto tersedia

## Audio
Audio dibuat sebagai aset file nyata. Browser biasanya membutuhkan interaksi pengguna sebelum audio dapat diputar; audio mulai setelah tombol permainan ditekan.

## Catatan teknis
Character/symbol artwork di sini adalah vector SVG terpisah agar ringan, tajam, dan stabil di GitHub Pages.
