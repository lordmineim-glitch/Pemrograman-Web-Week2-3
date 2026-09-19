# WATCH_DOGS // Digital Identity

Profil identitas digital bertema Watch Dogs, ditampilkan di dalam bingkai smartphone.

## Struktur

```
index.html                    struktur & markup          — Rafi
assets/css/style.css          token warna, layout, komponen  — Rafi
assets/css/animations.css     keyframes & efek gerak     — Sena
assets/js/ui.js               data profil, render, jam, panel edit — Rafi
assets/js/fx.js               boot, glitch, terminal, scan, partikel — Sena
```

## Pembagian kerja

**TUbagus — UI & data**
Menyusun markup, sistem token warna, layout kartu, dan state profil.
Aturan yang dia pegang: `style.css` tidak boleh berisi `@keyframes`, dan
`ui.js` tidak memanipulasi animasi secara langsung — cukup lempar event.

**Izyan — motion & FX**
Semua yang bergerak. `animations.css` dimuat setelah `style.css` supaya
properti `animation`/`transition` menimpa layout. `fx.js` hanya membaca
`window.WD`, tidak pernah menulis ke data profil.

## Kontrak antar modul

`ui.js` membuat namespace global:

| Anggota | Isi |
|---|---|
| `WD.data` | objek profil aktif |
| `WD.el(id)` | shortcut `getElementById` |
| `WD.render()` | gambar ulang seluruh field |
| `WD.bus` | `EventTarget` penghubung dua modul |
| `WD.markVerified()` | dipanggil fx.js setelah scan 100% |
| `WD.fx` | diisi fx.js: `glitch`, `type`, `scan`, `boot` |

Event di `WD.bus`: `wd:ready`, `wd:updated`, `wd:access`, `wd:scan`.

Urutan `<script>` wajib `ui.js` lalu `fx.js` — keduanya `defer`.

## Mengisi data

Buka `assets/js/ui.js`, ubah objek `DEFAULTS` di bagian atas:

```js
const DEFAULTS = {
  name:   "ISI NAMA",
  user:   "@ISI_USERNAME",
  weapon: "ISI SENJATA",
  nim:    "ISI NIM",
  photo:  ""          // "foto.jpg" atau data URI
};
```

Alternatifnya, pakai tombol **EDIT DATA** di layar. Hasilnya tersimpan di
`localStorage` browser dan menimpa `DEFAULTS`. Untuk kembali ke nilai
default, hapus key `wd_profile_v1` dari storage browser.

## Menjalankan

Buka `index.html` langsung di browser — tidak ada build step dan tidak ada
dependensi selain Google Fonts. Kalau di-hosting, unggah seluruh folder
beserta struktur `assets/`-nya.
