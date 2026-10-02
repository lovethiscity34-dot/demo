# Horus Super Win 1000 — Stage 3

Tahap 3 fokus khusus pada **Normal Mode**.

## Perubahan
- Reel Normal Mode kini benar-benar rolling dan berhenti satu per satu dari kiri ke kanan.
- Normal spin dibuat lebih lambat/cinematic; Turbo tetap cepat.
- Win detection tetap berbasis 8+ simbol identik non-Scatter.
- Win highlight diberi jeda sebelum simbol dihapus.
- Tumble: simbol menang hilang → simbol di atas jatuh → slot kosong diisi → cek kemenangan lagi.
- RNG Normal diperketat dengan weighted bag yang lebih jarang menghasilkan 8+ match.
- Probabilitas Scatter Normal diturunkan untuk menjaga frekuensi mode bonus tetap rendah pada tahap ini.
- Memperbaiki bug perhitungan Free Spin: jumlah tambahan tidak lagi dihitung dua kali.
- Tidak ada negative credit; validasi taruhan tetap menggunakan Credit Engine.

## Belum masuk Stage 3
- Scatter Mode visual/ultimate final
- multiplier x1–x1000
- Horus character animation final
- audio engine
- final responsive/mobile redesign

## Validasi
Semua file JS Stage 3 dicek dengan `node --check`. Proyek tetap memakai script biasa agar sederhana untuk GitHub Pages/static hosting.
