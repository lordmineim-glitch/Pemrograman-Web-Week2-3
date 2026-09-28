// =========================================================
// SCRIPT.JS
// File ini sengaja dibuat sederhana.
// Isinya cuma untuk membuka/menutup menu navbar saat di HP.
// =========================================================

function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("open");
}

// =========================================================
// INTRO OVERLAY (efek petasan)
// Cuma jalan kalau elemen #intro-overlay ada di halaman
// (yaitu cuma di index.html / Home)
// =========================================================
window.addEventListener("load", function () {
  const overlay = document.getElementById("intro-overlay");
  if (overlay) {
    setTimeout(function () {
      overlay.classList.add("hide");
    }, 1600); // ganti angka ini (dalam milidetik) kalau mau overlay lebih lama/cepat
  }
});
