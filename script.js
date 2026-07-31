document.addEventListener("DOMContentLoaded", () => {
  const navButtons = document.querySelectorAll(".nav-btn");
  const activePill = document.getElementById("active-pill");
  const themeBtn = document.getElementById("theme-btn");
  const nav = document.getElementById("nav");
  const glare = document.getElementById("glare");

  function updatePill(btn, smooth = true) {
    if (!btn) return;

    activePill.style.transition = smooth
      ? "transform .5s cubic-bezier(.34,1.2,.64,1), width .5s cubic-bezier(.34,1.2,.64,1)"
      : "none";

    activePill.style.width = `${btn.offsetWidth}px`;
    activePill.style.transform = `translateX(${btn.offsetLeft}px)`;
  }

  // Sahifa yuklanganda pillni boshlang'ich faol tugma ustiga to'g'rilash
  const initialActive = document.querySelector(".nav-btn.active");
  if (initialActive) {
    setTimeout(() => {
      updatePill(initialActive, false);
      // keyingi harakatlar uchun tekis animatsiyani qayta yoqamiz
      void activePill.offsetWidth;
    }, 50);
  }

  // Har bir nav tugmasi bosilganda pillni shu tugma ustiga suramiz
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // theme tugmasi alohida ishlaydi, pill unga siljimaydi
      if (btn.id === "theme-btn") return;

      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updatePill(btn);
    });
  });

  // Oyna o'lchami o'zgarsa (masalan ekran burilsa) pill joylashuvini qayta hisoblaymiz
  window.addEventListener("resize", () => {
    const current = document.querySelector(".nav-btn.active");
    updatePill(current, false);
  });

  // ---------- (yorug' / qorong'i) ----------
  themeBtn.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    html.setAttribute("data-theme", isDark ? "light" : "dark");
  });

  // ---------- (sichqoncha harakatiga qarab yorqinlik) ----------
  nav.addEventListener("mousemove", (e) => {
    const rect = nav.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    glare.style.setProperty("--mx", `${x}%`);
    glare.style.setProperty("--my", `${y}%`);
  });
});
