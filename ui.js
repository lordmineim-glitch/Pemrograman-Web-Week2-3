/* ============================================================
   ui.js — data profil, render, jam, panel edit
   Owner : Rafi
   ------------------------------------------------------------
   File ini yang membuat namespace global `window.WD`.
   Isi kontraknya (dipakai fx.js):

     WD.data                -> objek profil aktif
     WD.el(id)              -> shortcut getElementById
     WD.render()            -> gambar ulang semua field
     WD.bus                 -> EventTarget untuk komunikasi antar modul
     WD.fx                  -> diisi oleh fx.js (boleh undefined saat awal)

   Event yang aku kirim ke bus:
     "wd:ready"      -> DOM & data siap, silakan mulai boot
     "wd:updated"    -> data profil berubah (habis disimpan)
     "wd:access"     -> tombol ACCESS PROFILE ditekan (detail: array baris)
     "wd:scan"       -> tombol SCAN IDENTITY ditekan
   ============================================================ */

(function () {
  "use strict";

  /* ---------- DATA PROFIL: ubah di sini ---------- */
  const DEFAULTS = {
    name:   "ISI NAMA",
    user:   "@ISI_USERNAME",
    weapon: "ISI SENJATA",
    nim:    "ISI NIM",
    photo:  ""            // path gambar ("foto.jpg") atau data URI
  };
  /* ----------------------------------------------- */

  const STORAGE_KEY = "wd_profile_v1";

  const el  = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, "0");

  /* muat data tersimpan (kalau ada) */
  let data = { ...DEFAULTS };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) data = { ...data, ...JSON.parse(saved) };
  } catch (err) {
    console.warn("[ui] localStorage tidak tersedia, pakai default.");
  }

  /* namespace bersama */
  const WD = window.WD = {
    data,
    el,
    bus: new EventTarget(),
    fx: null,          // diisi fx.js
    render,
    DEFAULTS
  };

  /* ---------- util ---------- */

  function buildUserId(seed) {
    let h = 0x5f3a;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return "0x" + h.toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
  }

  function weaponClass(weapon) {
    const s = weapon.toLowerCase();
    if (/sniper|rifle|dmr/.test(s))            return "CLASS · MARKSMAN";
    if (/smg|vector|mp5|uzi/.test(s))          return "CLASS · SUBMACHINE";
    if (/shotgun|spas/.test(s))                return "CLASS · CLOSE QUARTERS";
    if (/pistol|glock|revolver|1911/.test(s))  return "CLASS · SIDEARM";
    if (/stun|taser|drone|hack|gadget/.test(s))return "CLASS · NON-LETHAL";
    return "CLASS · CUSTOM LOADOUT";
  }

  function lastLoginStamp() {
    const d = new Date(Date.now() - 1000 * 60 * 47);
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  /* ---------- render ---------- */

  function render() {
    const d = WD.data;

    el("fName").textContent = d.name;
    el("fName").dataset.t   = d.name;      // dipakai efek glitch
    el("fUser").textContent = d.user;
    el("fNim").textContent  = d.nim;

    el("fWeapon").textContent = d.weapon;
    el("fWclass").textContent = weaponClass(d.weapon);

    el("fUid").textContent  = buildUserId(d.name + d.nim);
    el("fLast").textContent = lastLoginStamp();

    const img = el("photoImg"), ph = el("photoPh");
    if (d.photo) {
      img.src = d.photo;
      img.hidden = false;
      ph.style.display = "none";
    } else {
      img.hidden = true;
      ph.style.display = "grid";
    }
  }

  /* ---------- jam ---------- */

  function tick() {
    const n = new Date();
    el("clock").textContent   = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
    el("sbclock").textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}`;
  }

  /* ---------- tombol aksi ---------- */

  function onAccessProfile() {
    const d = WD.data;
    const lines = [
      "> access_profile --target=self",
      "> decrypting record ......... done",
      "> NAME     : " + d.name,
      "> ALIAS    : " + d.user,
      "> NIM      : " + d.nim,
      "> LOADOUT  : " + d.weapon,
      "> UID      : " + buildUserId(d.name + d.nim),
      "> record unsealed. 5 fields exposed."
    ];
    el("content").scrollTo({ top: el("content").scrollHeight, behavior: "smooth" });
    WD.bus.dispatchEvent(new CustomEvent("wd:access", { detail: { lines } }));
  }

  function onScanIdentity() {
    WD.bus.dispatchEvent(new Event("wd:scan"));
  }

  /* dipanggil balik oleh fx.js setelah progress 100% */
  WD.markVerified = function () {
    el("vBadge").classList.remove("pending");
    el("vText").textContent = "IDENTITY VERIFIED";
  };

  /* ---------- panel edit ---------- */

  function openSheet() {
    el("inName").value   = WD.data.name   === DEFAULTS.name   ? "" : WD.data.name;
    el("inUser").value   = WD.data.user   === DEFAULTS.user   ? "" : WD.data.user;
    el("inWeapon").value = WD.data.weapon === DEFAULTS.weapon ? "" : WD.data.weapon;
    el("inNim").value    = WD.data.nim    === DEFAULTS.nim    ? "" : WD.data.nim;
    el("sheet").classList.add("on");
  }

  function closeSheet() {
    el("sheet").classList.remove("on");
  }

  function pickPhoto(ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { WD.data.photo = reader.result; render(); };
    reader.readAsDataURL(file);
  }

  function saveProfile() {
    WD.data.name   = (el("inName").value.trim() || DEFAULTS.name).toUpperCase();
    WD.data.user   = el("inUser").value.trim()   || DEFAULTS.user;
    WD.data.weapon = el("inWeapon").value.trim() || DEFAULTS.weapon;
    WD.data.nim    = el("inNim").value.trim()    || DEFAULTS.nim;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(WD.data));
    } catch (err) {
      console.warn("[ui] gagal menyimpan ke localStorage:", err);
    }

    render();
    closeSheet();
    WD.bus.dispatchEvent(new Event("wd:updated"));
  }

  /* ---------- init ---------- */

  function init() {
    render();
    tick();
    setInterval(tick, 1000);

    el("btnAccess").addEventListener("click", onAccessProfile);
    el("btnScan").addEventListener("click", onScanIdentity);
    el("editBtn").addEventListener("click", openSheet);
    el("closeBtn").addEventListener("click", closeSheet);
    el("saveBtn").addEventListener("click", saveProfile);
    el("inPhoto").addEventListener("change", pickPhoto);

    /* fx.js menunggu sinyal ini sebelum menjalankan boot */
    WD.bus.dispatchEvent(new Event("wd:ready"));
  }

  init();
})();
