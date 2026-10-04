HORUS SUPER WIN 1000 — SCATTER/MULTIPLIER + REEL AUDIO FIX V3

Dibuat berdasarkan base + patch Scatter/Multiplier sebelumnya, lalu ditambahkan perbaikan audio reel.

Penting:
- Patch ini mempertahankan notifikasi Multiplier dan Scatter yang sudah terintegrasi di area reel.
- Tidak mengembalikan toast bawah untuk activation/multiplier.
- Multiplier hanya diproses jika cell multiplier ikut dalam connect/win valid.
- Retrigger Scatter: 4–5 +15, 6–7 +20, 8–9 +25, 10–11 +30, dst.
- Audio rolling normal sekarang memakai file yang sama karakter suaranya dengan rolling Scatter yang sudah terbukti terdengar, tetapi diturunkan sedikit agar cocok dengan mode normal.
- Jangan hapus asset/audio lain.

File patch yang perlu di-replace:
js/audio-engine.js
js/game-engine.js
js/main.js
js/multiplier-engine.js
js/scatter-mode.js
js/tumble-engine.js
css/core.css
index.html
audio/normal/reel-roll.mp3
audio/scatter/reel-roll.mp3
audio/scatter/symbol-win.mp3
