/* =========================================================
   ralf1q — script.js (FULL)
   - Reveal animations
   - Active nav highlight (top + footer)
   - Terminal typing (home only)
   - Particles background (canvas)
   - Boot splash (ONLY on /home) + glitch flicker on BOOT OK
   - Quick screen-flash fade into the site
   - Mouse glow tracking + subtle parallax hover
   ========================================================= */

// ===== Reveal animations =====
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add("on");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
document.querySelectorAll(".label-reveal").forEach((el) => io.observe(el));

// ===== Active nav highlight (top + footer) =====
function applyActiveNav(){
  const path = location.pathname.replace(/\/+$/, "") || "/";
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const href = (a.getAttribute("href") || "").replace(/\/+$/, "");
    if (!href) return;
    const isActive = path === href || path.startsWith(href + "/");
    a.classList.toggle("active", !!isActive);
  });
}
applyActiveNav();

// ===== Terminal typing (home page only) =====
function typeLines(el, lines, speed = 16, linePause = 240) {
  let i = 0, j = 0;
  const caret = el.querySelector(".caret");
  const out = el.querySelector("[data-term-out]");
  if (!out) return;

  const next = () => {
    if (i >= lines.length) return;
    const line = lines[i];

    if (j === 0) {
      out.append(document.createElement("div"));
      out.lastChild.innerHTML = "";
    }

    out.lastChild.innerHTML = line.slice(0, j + 1);
    j++;

    if (j < line.length) setTimeout(next, speed);
    else { i++; j = 0; setTimeout(next, linePause); }
  };

  const follow = setInterval(() => caret?.scrollIntoView({ block: "nearest" }), 500);
  next();
  setTimeout(() => clearInterval(follow), 25000);
}

const term = document.querySelector("[data-terminal]");
if (term) {
  const lines = [
    "<span class='prompt'>ralf1q@pc</span>:~$ <span>spec --print</span>",
    "<span style='opacity:.85'>CPU</span>  AMD Ryzen 9 5900X (12C/24T)",
    "<span style='opacity:.85'>GPU</span>  NVIDIA GeForce RTX 3070 Ti",
    "<span style='opacity:.85'>RAM</span>  32GB",
    "<span class='prompt'>ralf1q@pc</span>:~$ <span>run clean-check</span>",
    "<span style='opacity:.85'>[OK]</span> temp cleanup queued",
    "<span style='opacity:.85'>[OK]</span> defender signatures update",
    "<span style='opacity:.85'>[OK]</span> quick scan started",
    "<span style='opacity:.85'>[TIP]</span> updates: check Optional drivers",
  ];
  typeLines(term, lines);
}

// ===== Particles (canvas) =====
(function particles(){
  const canvas = document.getElementById("particles");
  if (!canvas) return;

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0, h = 0;
  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  function resize(){
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const COUNT = Math.max(38, Math.min(90, Math.floor((w*h) / 26000)));
  const pts = [];
  const rnd = (a,b) => a + Math.random()*(b-a);

  for (let i=0;i<COUNT;i++){
    pts.push({
      x: rnd(0,w),
      y: rnd(0,h),
      vx: rnd(-0.12,0.12),
      vy: rnd(-0.10,0.10),
      r: rnd(0.8, 2.2),
      a: rnd(0.18, 0.55)
    });
  }

  let t = 0;
  function step(){
    t += 0.0035;
    ctx.clearRect(0,0,w,h);

    const g = ctx.createRadialGradient(w*0.75, h*0.15, 0, w*0.75, h*0.15, Math.max(w,h)*0.9);
    g.addColorStop(0, "rgba(126,252,255,0.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    for (const p of pts){
      p.x += p.vx + Math.sin(t + p.y*0.01)*0.03;
      p.y += p.vy + Math.cos(t + p.x*0.01)*0.02;

      if (p.x < -10) p.x = w+10;
      if (p.x > w+10) p.x = -10;
      if (p.y < -10) p.y = h+10;
      if (p.y > h+10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();
    }

    ctx.lineWidth = 1;
    for (let i=0;i<pts.length;i++){
      for (let j=i+1;j<pts.length;j++){
        const a = pts[i], b = pts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120){
          const alpha = (1 - dist/120) * 0.12;
          ctx.strokeStyle = `rgba(126,252,255,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();

// =========================================================
// Boot splash (ONLY on /home) + glitch flicker + screen flash
// =========================================================
(function bootSplashHomeOnly(){
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  // Only run on /home (or /home/)
  const p = location.pathname.replace(/\/+$/, "");
  if (p !== "/home") return;

  // If user uses bfcache (back/forward), don't boot again
  const navEntry = performance.getEntriesByType?.("navigation")?.[0];
  const navType = navEntry?.type || "";
  if (navType === "back_forward") return;

  const boot = document.createElement("div");
  boot.className = "boot";
  boot.innerHTML = `
    <div class="boot-panel">
      <div class="boot-top">
        <div class="boot-brand">
          <span class="boot-mark"></span>
          <span>RALF1Q</span>
        </div>
        <div class="boot-status">BOOT · INIT</div>
      </div>
      <div class="boot-body">
        <div class="boot-lines">
          <div><span class="k">[INIT]</span> core systems</div>
          <div><span class="k">[LOAD]</span> ui modules</div>
          <div><span class="k">[SYNC]</span> navigation + footer</div>
          <div><span class="k">[ARM]</span> particles engine</div>
          <div><span class="k">[READY]</span> environment stable</div>
        </div>
        <div class="boot-bar"><i id="bootFill"></i></div>
        <div class="boot-hint">Press any key / click to skip</div>
      </div>
    </div>
    <div id="bootFlash" style="
      position:absolute; inset:0; pointer-events:none;
      background: radial-gradient(900px 700px at 50% 30%, rgba(126,252,255,.18), rgba(255,255,255,.08), transparent 70%);
      opacity:0; transition: opacity .28s ease;
    "></div>
  `;

  document.body.appendChild(boot);
  requestAnimationFrame(() => boot.classList.add("on"));

  const fill = boot.querySelector("#bootFill");
  const status = boot.querySelector(".boot-status");
  const flash = boot.querySelector("#bootFlash");

  const duration = 3200;
  const endPause = 520;
  const start = performance.now();

  let finished = false;
  let glitchTimer = null;

  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

  function glitchFlickerOK(){
    const frames = ["BOOT · OK","B00T · OK","BOOT · 0K","BOOT · OK","BO0T · OK","BOOT · OK"];
    let idx = 0;
    const base = "BOOT · OK";
    const startT = performance.now();

    clearInterval(glitchTimer);
    glitchTimer = setInterval(() => {
      const elapsed = performance.now() - startT;
      if (elapsed > 600) {
        clearInterval(glitchTimer);
        status.textContent = base;
        status.style.letterSpacing = "";
        status.style.opacity = "";
        return;
      }
      status.textContent = frames[idx++ % frames.length];
      status.style.letterSpacing = (Math.random() > 0.6) ? ".22em" : "";
      status.style.opacity = (Math.random() > 0.7) ? "0.78" : "1";
    }, 85);
  }

  function screenFlashAndExit(){
    flash.style.opacity = "1";
    setTimeout(() => { flash.style.opacity = "0"; }, 160);

    boot.classList.remove("on");
    boot.classList.add("off");

    setTimeout(() => {
      boot.remove();
      applyActiveNav();
    }, 650);
  }

  function finish(){
    if (finished) return;
    finished = true;

    glitchFlickerOK();
    setTimeout(screenFlashAndExit, 320);
  }

  function tick(now){
    const raw = Math.min(1, (now - start) / duration);
    const eased = easeOutCubic(raw);
    fill.style.width = Math.floor(eased * 100) + "%";

    if (raw < 0.20) status.textContent = "BOOT · INIT";
    else if (raw < 0.48) status.textContent = "BOOT · LOAD";
    else if (raw < 0.74) status.textContent = "BOOT · LINK";
    else if (raw < 0.94) status.textContent = "BOOT · FINALIZE";
    else status.textContent = "BOOT · OK";

    if (raw < 1) requestAnimationFrame(tick);
    else setTimeout(finish, endPause);
  }

  requestAnimationFrame(tick);

  const skip = () => {
    if (finished) return;
    finished = true;
    fill.style.width = "100%";
    status.textContent = "BOOT · OK";
    screenFlashAndExit();
  };
  window.addEventListener("keydown", skip, { once:true });
  boot.addEventListener("click", skip, { once:true });
})();

// =========================
// Mouse glow + subtle parallax
// =========================
(function mouseGlow(){
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  document.documentElement.style.setProperty("--m0", "1");

  let mx = window.innerWidth * 0.5;
  let my = window.innerHeight * 0.4;
  let raf = 0;

  function apply(){
    raf = 0;
    document.documentElement.style.setProperty("--mx", mx + "px");
    document.documentElement.style.setProperty("--my", my + "px");
  }

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!raf) raf = requestAnimationFrame(apply);
  }, { passive: true });

  const targets = Array.from(document.querySelectorAll(".card, .tool, .log-item, .tile, .spec, .sticker, .footer-block"));
  let active = null;

  function reset(el){ el.style.transform = ""; }

  targets.forEach((el) => {
    el.addEventListener("mouseenter", () => { active = el; }, { passive:true });
    el.addEventListener("mouseleave", () => { reset(el); active = null; }, { passive:true });
    el.addEventListener("mousemove", (e) => {
      if (!active) return;

      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;

      const rx = (py - 0.5) * -2;
      const ry = (px - 0.5) * 2;

      const tx = ry * 2.0;
      const ty = rx * 2.0;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    }, { passive:true });
  });

  window.addEventListener("mouseleave", () => {
    document.documentElement.style.setProperty("--m0", "0.2");
  });
  window.addEventListener("mouseenter", () => {
    document.documentElement.style.setProperty("--m0", "1");
  });
})();