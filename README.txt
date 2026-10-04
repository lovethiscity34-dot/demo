HORUS SUPER WIN 1000 — UPDATE PATCH

Ganti/timpa hanya file berikut dari project FINAL-V2:

index.html
css/core.css
js/config.js
js/reel-engine.js
js/scatter-mode.js
js/game-engine.js
js/main.js

JANGAN upload ulang assets/ atau audio/.

Perubahan:
- Grid reel menjadi 5x5.
- Continuous reel strip tetap digunakan; tidak ada ruang kosong saat rolling.
- Fase akhir rolling diperhalus dengan deceleration dan staggered stop yang benar.
- Fix timing stop reel agar tidak render hasil terlalu cepat sebelum reel terakhir selesai.
- Loading screen Horus.
- Desktop/mobile dibuat satu viewport tanpa scroll.
- Kontrol mobile dipusatkan.
- Label Normal Mode / Scatter Mode disembunyikan.
- Scatter background menjadi merah saat Scatter aktif.
- Modal konfirmasi Buy Scatter dengan harga, tombol X dan ✓.
- Buy Scatter tetap memakai lifecycle Scatter yang sudah ada dan dapat dibeli berulang.
- Aturan UI diperbarui menjadi 5x5.

Setelah mengganti file, lakukan hard refresh (Ctrl+F5).
