document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------------------------------
     DATA — each tab's title, subtitle and icon markup
  --------------------------------------------------- */
  const TABS = [
    {
      key: "home",
      label: "Home",
      title: "Home",
      subtitle: "Everything, on one surface.",
      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    },
    {
      key: "profile",
      label: "Profile",
      title: "Profile",
      subtitle: "You, at a glance.",
      icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    },
    {
      key: "messages",
      label: "Messages",
      title: "Messages",
      subtitle: "Say it, see it, sorted.",
      icon: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    },
    {
      key: "camera",
      label: "Camera",
      title: "Camera",
      subtitle: "Capture without the clutter.",
      icon: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    },
    {
      key: "settings",
      label: "Settings",
      title: "Settings",
      subtitle: "Fewer switches. Better defaults.",
      icon: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    },
  ];

  /* ---------------------------------------------------
     DOM
  --------------------------------------------------- */
  const dockWrap = document.getElementById("dockWrap");
  const dockSvg = document.getElementById("dockSvg");
  const dockPath = document.getElementById("dockPath");
  const tabButtons = [...document.querySelectorAll(".tab")];
  const bead = document.getElementById("bead");
  const beadIcon = document.getElementById("beadIcon");
  const tabLabel = document.getElementById("tabLabel");
  const hero = document.querySelector(".hero");
  const heroTitle = document.getElementById("heroTitle");
  const heroSub = document.getElementById("heroSub");

  /* ---------------------------------------------------
     GEOMETRY CONSTANTS
     — the socket is a parametric cut, not a fixed shape:
       its shoulder width is solved so the curve stays
       tangent to both the flat top edge and the bead.
  --------------------------------------------------- */
  const RB = 27; // bead radius (must match CSS .bead size / 2)
  const EMBED = 8; // local y of the bead's center below the top edge line
  const BASE_S = 16; // resting shoulder radius (tight, snug fillet)
  const VMAX = 1100; // px/s — velocity that maxes out the squish

  let W = 0,
    H = 92;
  let barTop = 26,
    barBottom = 86,
    capR = 30;

  function measure() {
    W = dockWrap.clientWidth;
    H = dockWrap.clientHeight;
    barBottom = H - 6;
    barTop = 26;
    capR = (barBottom - barTop) / 2;
    dockSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    dockSvg.setAttribute("width", W);
    dockSvg.setAttribute("height", H);

    // bead & label sit at fixed absolute heights derived from the same geometry
    bead.style.top = barTop + EMBED - RB + "px";
    tabLabel.style.top = barBottom + 12 + "px";
  }

  // horizontal offset (from the bead's cx) of the point where a shoulder
  // circle of radius s is simultaneously tangent to the flat top line
  // AND tangent to the bead circle (radius rb, center `by` below the line)
  function reach(s, rb, by) {
    const inner = (s + rb) * (s + rb) - (s - by) * (s - by);
    return Math.sqrt(Math.max(inner, 0));
  }

  function tangentPoint(cx, s, by, rb, side) {
    const r = reach(s, rb, by);
    const c1x = cx + side * r; // shoulder circle center (sits ON the line, y = s)
    const c1y = s;
    const vx = cx - c1x,
      vy = by - c1y;
    const dist = Math.sqrt(vx * vx + vy * vy) || 1;
    const tx = c1x + s * (vx / dist);
    const ty = c1y + s * (vy / dist);
    return { lineX: c1x, tx, ty };
  }

  function buildPath(cx, sL, sR) {
    const slot = W / TABS.length;
    const maxReach = slot * 0.46;

    const left = tangentPoint(cx, sL, EMBED, RB, -1);
    const right = tangentPoint(cx, sR, EMBED, RB, 1);

    const leftLineX = Math.max(cx - maxReach, left.lineX);
    const rightLineX = Math.min(cx + maxReach, right.lineX);

    const d = `
      M ${capR} ${barTop}
      L ${leftLineX} ${barTop}
      A ${sL} ${sL} 0 0 1 ${left.tx} ${left.ty + barTop}
      A ${RB} ${RB} 0 0 1 ${right.tx} ${right.ty + barTop}
      A ${sR} ${sR} 0 0 1 ${rightLineX} ${barTop}
      L ${W - capR} ${barTop}
      A ${capR} ${capR} 0 0 1 ${W} ${barTop + capR}
      L ${W} ${barBottom - capR}
      A ${capR} ${capR} 0 0 1 ${W - capR} ${barBottom}
      L ${capR} ${barBottom}
      A ${capR} ${capR} 0 0 1 0 ${barBottom - capR}
      L 0 ${barTop + capR}
      A ${capR} ${capR} 0 0 1 ${capR} ${barTop}
      Z
    `;
    dockPath.setAttribute("d", d);
  }

  let centers = [];
  function measureCenters() {
    centers = tabButtons.map((btn) => btn.offsetLeft + btn.offsetWidth / 2);
  }

  const state = {
    x: 0,
    prevX: 0,
    vx: 0,
    target: 0,
    dragging: false,
    animating: false,
    raf: null,
    lastT: performance.now(),
  };

  let activeIndex = 0;

  function placeBead(x) {
    bead.style.left = x + "px";
    tabLabel.style.left = x + "px";
  }

  function tick(now) {
    const dt = Math.min((now - state.lastT) / 1000, 0.05) || 0.016;
    state.lastT = now;

    if (state.dragging) {
      state.vx = (state.x - state.prevX) / dt;
    } else if (state.animating) {
      const dx = state.target - state.x;
      state.x += dx * Math.min(dt * 10, 1); // spring-ish approach
      state.vx = (state.x - state.prevX) / dt;
      if (Math.abs(dx) < 0.4 && Math.abs(state.vx) < 4) {
        state.x = state.target;
        state.vx = 0;
        state.animating = false;
      }
    } else {
      state.vx *= 0.85; // idle decay
      if (Math.abs(state.vx) < 1) state.vx = 0;
    }

    const mag = Math.min(Math.abs(state.vx) / VMAX, 1);
    const q = Math.max(-1, Math.min(state.vx / VMAX, 1));
    const sL = BASE_S * (1 + 0.06 * mag + 0.4 * q);
    const sR = BASE_S * (1 + 0.06 * mag - 0.4 * q);

    buildPath(state.x, sL, sR);
    placeBead(state.x);

    state.prevX = state.x;

    const stillMoving =
      state.dragging || state.animating || Math.abs(state.vx) > 0.5;
    if (stillMoving) {
      state.raf = requestAnimationFrame(tick);
    } else {
      state.raf = null;
    }
  }

  function wake() {
    if (!state.raf) {
      state.lastT = performance.now();
      state.raf = requestAnimationFrame(tick);
    }
  }

  function setActive(index, { animate = true } = {}) {
    if (index === activeIndex && !animate) {
      /* still allow forced refresh */
    }
    activeIndex = index;
    const tab = TABS[index];

    tabButtons.forEach((btn, i) => {
      btn.classList.toggle("is-active", i === index);
      btn.setAttribute("aria-selected", i === index ? "true" : "false");
    });

    beadIcon.innerHTML = tab.icon;
    tabLabel.textContent = tab.label;

    hero.classList.add("is-swapping");
    setTimeout(() => {
      heroTitle.textContent = tab.title;
      heroSub.textContent = tab.subtitle;
      hero.classList.remove("is-swapping");
    }, 140);

    state.target = centers[index];
    state.animating = true;
    wake();
  }

  function nearestIndex(x) {
    let best = 0,
      bestDist = Infinity;
    centers.forEach((c, i) => {
      const d = Math.abs(c - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }

  tabButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => setActive(i));
  });

  bead.addEventListener("pointerdown", (e) => {
    bead.setPointerCapture(e.pointerId);
    state.dragging = true;
    state.animating = false;
    state.prevX = state.x;
    state.lastT = performance.now();
    wake();
  });

  bead.addEventListener("pointermove", (e) => {
    if (!state.dragging) return;
    const rect = dockWrap.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(centers[0], Math.min(centers[centers.length - 1], x));
    state.x = x;
  });

  function endDrag(e) {
    if (!state.dragging) return;
    state.dragging = false;
    const idx = nearestIndex(state.x);
    setActive(idx);
  }

  bead.addEventListener("pointerup", endDrag);
  bead.addEventListener("pointercancel", endDrag);

  function init() {
    measure();
    measureCenters();
    state.x = centers[0];
    state.prevX = state.x;
    state.target = centers[0];
    buildPath(state.x, BASE_S, BASE_S);
    placeBead(state.x);
    setActive(0, { animate: false });
  }

  window.addEventListener("resize", () => {
    measure();
    measureCenters();
    state.x = centers[activeIndex];
    state.target = state.x;
    buildPath(state.x, BASE_S, BASE_S);
    placeBead(state.x);
  });

  init();
});
