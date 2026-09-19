/* ------------------------------------------------------------------
 * fx.js  ·  sena
 * semua yang bergerak: boot sequence, glitch, ketikan terminal,
 * overlay scan, partikel background.
 *
 * aku nggak nyentuh data profil sama sekali — semua lewat window.WD
 * yang dibikin rafi. kalau WD belum ada, file ini diam aja.
 * ------------------------------------------------------------------ */

(function () {
  "use strict";

  var WD = window.WD;
  if (!WD) { console.error("[fx] window.WD belum ada — cek urutan <script>."); return; }

  var el = WD.el;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============ 1. BOOT SEQUENCE ============ */

  var BOOT_LINES = [
    ["ctOS handshake .............", "ok"],
    ["mounting secure volume .....", "ok"],
    ["decrypting identity blob ...", "ok"],
    ["tracing network node .......", "warn"],
    ["masking origin address .....", "ok"],
    ["profile ready", "ok"]
  ];

  function runBoot() {
    if (reduced) { finishBoot(); return; }

    var log = el("bootlog");
    var bar = el("bootbar");
    var i = 0;

    (function step() {
      if (i >= BOOT_LINES.length) { setTimeout(finishBoot, 380); return; }

      var txt = BOOT_LINES[i][0];
      var kind = BOOT_LINES[i][1];
      var tag = kind === "warn" ? "MASKED" : "OK";

      log.insertAdjacentHTML("beforeend",
        txt + ' <span class="' + (kind === "warn" ? "warn" : "ok") + '">[' + tag + ']</span>\n');

      i++;
      bar.style.width = (i / BOOT_LINES.length * 100) + "%";
      setTimeout(step, 240 + Math.random() * 220);
    })();
  }

  function finishBoot() {
    el("boot").classList.add("hide");

    // reveal berurutan
    ["cardId", "cardWeapon", "cardData", "cardActs", "term"].forEach(function (id, k) {
      setTimeout(function () { el(id).classList.add("in"); }, k * 110);
    });

    setTimeout(fillStatBars, 600);
    setTimeout(function () { glitch(el("fName")); }, 1400);
  }

  function fillStatBars() {
    var bars = document.querySelectorAll(".bar i");
    Array.prototype.forEach.call(bars, function (b, k) {
      setTimeout(function () { b.style.width = b.dataset.v + "%"; }, k * 140);
    });
  }

  /* ============ 2. GLITCH ============ */

  function glitch(node) {
    if (!node || reduced) return;
    node.classList.add("fire");
    setTimeout(function () { node.classList.remove("fire"); }, 620);
  }

  // sesekali aja, jangan terus-terusan — bikin pusing
  setInterval(function () {
    if (Math.random() > 0.55) glitch(el("fName"));
  }, 7000);

  /* ============ 3. TERMINAL TYPEWRITER ============ */

  var busy = false;

  function typeLines(lines, done) {
    if (busy) return;
    busy = true;

    var term = el("term");
    term.innerHTML = "";
    var li = 0;

    (function nextLine() {
      if (li >= lines.length) {
        term.insertAdjacentHTML("beforeend", '<span class="cur"></span>');
        busy = false;
        if (done) done();
        return;
      }

      var raw = lines[li];
      var span = document.createElement("span");
      term.appendChild(span);
      var ci = 0;

      (function nextChar() {
        if (ci >= raw.length) {
          term.insertAdjacentHTML("beforeend", "\n");
          li++;
          setTimeout(nextLine, 90);
          return;
        }
        span.textContent += raw.charAt(ci++);
        term.scrollTop = term.scrollHeight;
        setTimeout(nextChar, reduced ? 0 : 14);
      })();
    })();
  }

  /* ============ 4. OVERLAY SCAN ============ */

  var SCAN_MSGS = [
    "INITIALIZING SCANNER",
    "READING BIOMETRIC PATTERN",
    "CROSS-CHECKING ctOS RECORDS",
    "VALIDATING ENCRYPTION KEYS",
    "FINALIZING"
  ];

  var scanning = false;

  function runScan() {
    if (scanning) return;
    scanning = true;

    var box = el("scan"), bar = el("pbar"), pct = el("pct");
    var msg = el("scanmsg"), granted = el("granted"), ret = el("reticle");

    box.classList.add("on");
    granted.classList.remove("on");
    ret.style.display = "";
    pct.style.display = "";
    msg.style.display = "";

    var v = 0;
    var timer = setInterval(function () {
      v = Math.min(100, v + (reduced ? 25 : 1 + Math.random() * 3.4));
      bar.style.width = v + "%";
      pct.textContent = Math.floor(v) + "%";
      msg.textContent = SCAN_MSGS[Math.min(SCAN_MSGS.length - 1, Math.floor(v / 20))];

      if (v < 100) return;

      clearInterval(timer);
      setTimeout(function () {
        ret.style.display = "none";
        pct.style.display = "none";
        msg.style.display = "none";
        granted.classList.add("on");

        // balik ke rafi: dia yang urus badge di kartu identitas
        if (typeof WD.markVerified === "function") WD.markVerified();

        setTimeout(function () {
          box.classList.remove("on");
          bar.style.width = "0%";
          scanning = false;
          typeLines(["> scan complete", "> IDENTITY VERIFIED", "> ACCESS GRANTED"]);
        }, 1500);
      }, 300);
    }, 40);
  }

  /* ============ 5. PARTIKEL BACKGROUND ============ */

  function startParticles() {
    var canvas = el("bgfx");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var w, h, dots = [], streams = [];

    function resize() {
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";

      dots = [];
      for (var i = 0; i < 46; i++) {
        dots.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - .5) * .25 * dpr,
          vy: (Math.random() - .5) * .25 * dpr,
          r: (Math.random() * 1.4 + .4) * dpr
        });
      }

      streams = [];
      for (var j = 0; j < 16; j++) {
        streams.push({
          x: Math.random() * w, y: Math.random() * h,
          len: (40 + Math.random() * 130) * dpr,
          sp: (.6 + Math.random() * 1.8) * dpr
        });
      }
    }

    resize();
    window.addEventListener("resize", resize);
    if (reduced) return;   // statis aja, canvas tetap kosong

    (function frame() {
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "rgba(0,229,255,.55)";
      dots.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.fill();
      });

      streams.forEach(function (s) {
        var g = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.len);
        g.addColorStop(0, "rgba(0,229,255,0)");
        g.addColorStop(1, "rgba(0,229,255,.28)");
        ctx.strokeStyle = g;
        ctx.lineWidth = dpr;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x, s.y + s.len); ctx.stroke();

        s.y += s.sp;
        if (s.y > h) { s.y = -s.len; s.x = Math.random() * w; }
      });

      requestAnimationFrame(frame);
    })();
  }

  /* ============ 6. SAMBUNGAN KE ui.js ============ */

  WD.fx = {
    glitch: glitch,
    type: typeLines,
    scan: runScan,
    boot: runBoot
  };

  WD.bus.addEventListener("wd:access", function (e) {
    // kartu di-reveal ulang biar kelihatan "data masuk lagi"
    ["cardId", "cardWeapon", "cardData"].forEach(function (id, k) {
      var node = el(id);
      node.classList.remove("in");
      setTimeout(function () { node.classList.add("in"); }, 90 + k * 130);
    });
    typeLines(e.detail.lines);
    glitch(el("fName"));
  });

  WD.bus.addEventListener("wd:scan", runScan);

  WD.bus.addEventListener("wd:updated", function () {
    glitch(el("fName"));
    typeLines(["> record updated", "> re-indexing identity ... done"]);
  });

  /* ui.js sudah kirim "wd:ready" sebelum fx.js jalan, jadi tidak bisa
     ditangkap lewat listener. mulai langsung saja. */
  startParticles();
  runBoot();
})();
