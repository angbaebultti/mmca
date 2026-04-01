document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const qs = (s) => document.querySelector(s);
  const qsa = (s) => document.querySelectorAll(s);

  const ticketWrap = qs(".ticket");
  const ticketLeft = qs(".ticket_left img");
  const ticketRight = qs(".ticket_right img");
  const mainTitle = qs(".main_title");

  const about = qs(".about");
  const aboutHero = qs(".about_hero");
  const aboutContent = qs(".about_content");
  const aboutScene = qs(".about_scene");

  const stats = qsa(".stat");
  const ticketBg = qs(".ticket_bg");

  window.addEventListener("scroll", () => {
    if (window.innerWidth <= 480) return;
    const visual = qs(".main_visual");
    if (!visual) return;
    visual.style.zIndex = window.scrollY > 100 ? "5" : "1001";
  });

  if (ticketBg) {
    for (let i = 0; i < 12; i++) {
      const img = document.createElement("img");
      img.src = "img/ticket_full.png";
      img.classList.add("t");
      img.style.left = Math.random() * 100 + "%";
      img.style.top = -100 - Math.random() * 300 + "px";
      img.style.width = 500 + Math.random() * 400 + "px";
      img.style.transform = `rotate(${gsap.utils.random(-30, 30)}deg)`;
      img.style.opacity = 0;
      img.style.filter = `blur(${2 + Math.random() * 3}px)`;
      ticketBg.appendChild(img);
    }
  }

  const tickets = qsa(".t");

  const isMobile = window.innerWidth <= 1024;
  const isMobile480 = window.innerWidth <= 480;

  if (!isMobile480) {
    gsap.set(ticketLeft, {
      rotation: 0, x: 0, y: 0, opacity: 1,
      transformOrigin: "bottom center",
      scale: isMobile ? 0.65 : 1,
    });
    gsap.set(ticketRight, {
      rotation: 0, x: 0, y: 0, opacity: 1,
      transformOrigin: "bottom center",
      scale: isMobile ? 0.65 : 1,
    });
    gsap.set(ticketWrap, {
      opacity: 0,
      x: isMobile ? 20 : 220,
      y: isMobile ? 20 : 120,
    });
  }

  gsap.set(aboutContent, {
    opacity: isMobile480 ? 1 : 0,
    y: isMobile480 ? 0 : 60,
  });

  if (isMobile480) {
    gsap.set(mainTitle, { opacity: 1, y: 0, clearProps: "all" });
  }

  if (!isMobile480) {
    const mainTL = gsap.timeline({
      scrollTrigger: {
        trigger: ".main_visual",
        start: "top top",
        end: "+=1800",
        scrub: 1.2,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      },
    });

    mainTL
      .to(ticketWrap, { opacity: 1, x: 0, y: 0, ease: "power2.out", duration: 0.4 }, 0)
      .to(".info_wrap", { opacity: 0, y: -20, ease: "power1.out", duration: 0.3 }, 0.3)
      .to(mainTitle, { opacity: 0, y: -30, ease: "power1.out", duration: 0.3 }, 0.3)
      .to(ticketLeft, {
        rotation: -25, x: isMobile ? -40 : -150, y: isMobile ? 20 : 100,
        scale: isMobile ? 0.65 : 1, ease: "none", duration: 0.4,
      }, 0.35)
      .to(ticketRight, {
        rotation: 25, x: isMobile ? 40 : 150, y: isMobile ? 20 : 100,
        scale: isMobile ? 0.65 : 1, ease: "none", duration: 0.4,
      }, 0.35)
      .to(ticketLeft, { y: 1800, x: isMobile ? -80 : -400, rotationZ: -55, ease: "power2.in", duration: 1.4 }, 0.75)
      .to(ticketRight, { y: 1800, x: isMobile ? 80 : 400, rotationZ: 55, ease: "power2.in", duration: 1.4 }, 0.75)
      .to(ticketLeft, { opacity: 0, duration: 0.3 }, 1.8)
      .to(ticketRight, { opacity: 0, duration: 0.3 }, 1.8);

    const aboutTL = gsap.timeline({
      scrollTrigger: {
        trigger: about, start: "top top", end: "bottom bottom",
        scrub: 1.0, pin: ".about_scene", pinSpacing: true, anticipatePin: 1,
      },
    });

    aboutTL.to(aboutHero, { opacity: 0, scale: 0.95, y: -20, ease: "none", duration: 0.5 }, 0);

    tickets.forEach((t, i) => {
      gsap.set(t, { left: Math.random() * 80 + 10 + "%", top: "-20%", position: "absolute" });
      aboutTL.to(t, {
        opacity: 0.15,
        y: () => window.innerHeight * (0.68 + Math.random() * 0.18),
        x: () => gsap.utils.random(-140, 140),
        rotation: () => gsap.utils.random(-32, 32),
        scale: () => gsap.utils.random(0.55, 0.9),
        ease: "power1.out", duration: 0.5,
      }, 0.5 + i * 0.06);
    });

    aboutTL.to(aboutContent, { opacity: 1, y: 0, ease: "power4.out", duration: 1.0 }, 0.2);
  }

  if (aboutContent && stats.length) {
    const statArray = Array.from(stats);
    const lineLeft = qs(".line_left");
    const lineRight = qs(".line_right");
    const statsBg = qs(".stats_bg");

    const statData = statArray.map((stat) => {
      const strong = stat.querySelector("strong");
      const raw = strong ? strong.textContent.trim() : "0";
      const match = raw.replace(/,/g, "").match(/^(\d+)(.*)$/);
      return { el: strong, target: match ? parseInt(match[1]) : 0, suffix: match ? match[2] : "", original: raw };
    });

    statData.forEach((d) => { if (d.el) d.el.textContent = "0" + d.suffix; });
    gsap.set(statArray, { opacity: 0, x: 0 });

    if (!isMobile480) {
      if (statsBg) gsap.set(statsBg, { opacity: 0 });
      if (lineLeft) lineLeft.style.setProperty("--line-scale", 0);
      if (lineRight) lineRight.style.setProperty("--line-scale", 0);
    }

    function runStatAnimation() {
      statData.forEach((d) => { if (d.el) d.el.textContent = "0" + d.suffix; });
      gsap.set(statArray, { opacity: 0, x: isMobile480 ? 0 : -60 });
      if (!isMobile480) {
        if (statsBg) gsap.set(statsBg, { opacity: 0 });
        if (lineLeft) lineLeft.style.setProperty("--line-scale", 0);
        if (lineRight) lineRight.style.setProperty("--line-scale", 0);
      }
      const statTL = gsap.timeline();
      if (statsBg) statTL.to(statsBg, { opacity: 0.25, ease: "power2.out", duration: 0.8 }, 0);
      statTL.to({}, { duration: 0.6, onUpdate() { if (lineLeft) lineLeft.style.setProperty("--line-scale", this.progress()); } }, 0);
      statData.forEach((d, i) => {
        const counter = { val: 0 };
        statTL.to(statArray[i], { opacity: 1, x: 0, ease: "power3.out", duration: 0.6 }, 0.4 + i * 0.18);
        statTL.to(counter, {
          val: d.target, ease: "power2.out", duration: 1.2,
          onUpdate() { if (d.el) d.el.textContent = Math.round(counter.val).toLocaleString("en-US") + d.suffix; },
          onComplete() { if (d.el) d.el.textContent = d.original; },
        }, 0.4 + i * 0.18);
      });
      statTL.to({}, { duration: 0.6, onUpdate() { if (lineRight) lineRight.style.setProperty("--line-scale", this.progress()); } }, 1.4);
    }

    ScrollTrigger.create({ trigger: about, start: "top 50%", onEnter: () => runStatAnimation(), onEnterBack: () => runStatAnimation() });
  }

  /* =========================================================
   * 10. ARTIST PRIZE
   * ========================================================= */
  const artistCards = gsap.utils.toArray(".artist_card:not(.view_btn_card)");
  const letters = gsap.utils.toArray(".title_main span");

  if (!isMobile480) {
    gsap.set(artistCards, { opacity: 0, xPercent: 30 });

    function getScrollAmount() {
      const track = qs(".artist_track");
      if (!track) return 0;
      return -(track.scrollWidth - window.innerWidth);
    }

    if (letters.length) {
      letters.forEach((letter) => {
        gsap.set(letter, {
          x: gsap.utils.random(-300, 300), y: gsap.utils.random(-200, 200),
          rotation: gsap.utils.random(-45, 45), opacity: gsap.utils.random(0.1, 0.3), filter: "blur(6px)",
        });
      });
    }

    const masterTL = gsap.timeline({
      scrollTrigger: {
        trigger: ".artist_prize", start: "top 10%",
        end: () => "+=" + Math.abs(getScrollAmount()),
        scrub: 1.2, pin: true, anticipatePin: 1, pinSpacing: true,
      },
    });

    if (letters.length) {
      masterTL.to(letters, {
        x: 0, y: 0, rotation: 0, opacity: 1, filter: "blur(0px)",
        color: "#ffffff", "-webkit-text-stroke": "0px transparent",
        stagger: { each: 0.02, from: "random" }, ease: "power3.out", duration: 0.2,
      }, 0);
    }

    masterTL.to(artistCards, { opacity: 1, xPercent: 0, stagger: 0.03, ease: "power3.out", duration: 0.15 });
    if (letters.length) { masterTL.to(letters, { opacity: 0.3, ease: "power2.out", duration: 0.1 }, "<"); }
    masterTL.to(".artist_track", { x: getScrollAmount, ease: "none", duration: 1 });
    masterTL.to({}, { duration: 0.1 });
  }

  /* =========================================================
   * 11. NEWS
   * ========================================================= */
  const groups = Array.from(qsa(".news_group"));

  let newsPreview = null;
  let previewImg = null;

  if (!isMobile480) {
    newsPreview = document.createElement("div");
    newsPreview.id = "newsPreview";
    newsPreview.innerHTML = '<img id="previewImg" src="" alt="" />';
    document.body.appendChild(newsPreview);
    previewImg = document.getElementById("previewImg");
  }

  let previewX = 0, previewY = 0, previewRX = 0, previewRY = 0;

  if (!isMobile480) {
    (function lerpPreview() {
      previewRX += (previewX - previewRX) * 0.1;
      previewRY += (previewY - previewRY) * 0.1;
      if (newsPreview) { newsPreview.style.left = previewRX + "px"; newsPreview.style.top = previewRY + "px"; }
      requestAnimationFrame(lerpPreview);
    })();
    document.addEventListener("mousemove", (e) => { previewX = e.clientX; previewY = e.clientY; });
  }

  if (groups.length) {
    groups[0].classList.add("is-open");

    groups.forEach((group) => {
      const body = group.querySelector(".news_body");
      if (!body) return;

      group.addEventListener("click", () => {
        if (isMobile480) return;
        if (group.classList.contains("is-open")) return;

        const current = groups.find((g) => g.classList.contains("is-open"));
        if (current) current.classList.remove("is-open");
        group.classList.add("is-open");
      });

      const cards = group.querySelectorAll(".news_card");
      cards.forEach((card) => {
        const img = card.querySelector(".news_thumb img");
        if (!img || isMobile480) return;
        card.addEventListener("mouseenter", () => { previewImg.src = img.src; newsPreview.classList.add("is-visible"); });
        card.addEventListener("mouseleave", () => { newsPreview.classList.remove("is-visible"); });
      });
    });

    // 첫 탭 카드는 CSS 애니메이션으로 처리
  }

  if (isMobile480) {
    const mobileTabButtons = Array.from(qsa(".news_mobile_tab_btn"));
    const mobileTabPanels = Array.from(qsa(".news_mobile_tab_panel"));
    mobileTabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.tabTarget;
        mobileTabButtons.forEach((btn) => { const isActive = btn === button; btn.classList.toggle("is-active", isActive); btn.setAttribute("aria-selected", isActive ? "true" : "false"); });
        mobileTabPanels.forEach((panel) => { const isActive = panel.dataset.tabPanel === target; panel.classList.toggle("is-active", isActive); panel.hidden = !isActive; });
      });
    });
  }

  /* =========================================================
   * 12. SHOP
   * ========================================================= */
  const positionsDesktop = [
    { x: -580, y: -280, r: -15 }, { x: 120, y: -320, r: 10 }, { x: 560, y: -200, r: 20 },
    { x: -620, y: 20, r: 8 }, { x: 600, y: 60, r: -12 }, { x: -480, y: 280, r: -20 },
    { x: -80, y: 340, r: 5 }, { x: 380, y: 300, r: 18 }, { x: 620, y: 260, r: -10 },
  ];
  const positionsMobile = [
    { x: -280, y: -190, r: -15 }, { x: 80, y: -220, r: 10 }, { x: 260, y: -140, r: 20 },
    { x: -300, y: 5, r: 8 }, { x: 270, y: 40, r: -12 }, { x: -220, y: 180, r: -20 },
    { x: -40, y: 210, r: 5 }, { x: 200, y: 190, r: 18 }, { x: 290, y: 160, r: -10 },
  ];

  const positions = isMobile ? positionsMobile : positionsDesktop;
  const scale = isMobile ? 0.6 : 1;
  const scaledPositions = positions.map((p) => ({ x: p.x * scale, y: p.y * scale, r: p.r }));

  if (!isMobile480) {
    gsap.set(".p", { x: 0, y: 0, scale: 0.5, opacity: 0, rotation: (i) => positions[i].r * 0.3 });

    const shopTL = gsap.timeline({ scrollTrigger: { trigger: ".shop", start: "top top", end: "bottom bottom", scrub: 1.8 } });
    shopTL.to(".p", { opacity: 0.7, scale: 0.6, duration: 0.25, ease: "power1.out" }, 0);
    qsa(".p").forEach((el, i) => {
      shopTL.to(el, { opacity: 1, scale: 1, x: scaledPositions[i].x, y: scaledPositions[i].y, rotation: scaledPositions[i].r, ease: "expo.out", duration: 0.7 }, 0.25);
    });
    shopTL.to(".glass_front", { background: "rgba(255, 255, 255, 0.95)", boxShadow: "0 0 40px 20px rgba(255,255,255,0.4), 0 0 100px 40px rgba(255,255,255,0.2)", backdropFilter: "blur(0px)", duration: 0.4 }, 0.25);
    shopTL.to(".glass_front h2", { color: "#000", duration: 0.3 }, 0.3);
    shopTL.to(".glass_front p", { color: "#555", duration: 0.3 }, 0.3);
    shopTL.to(".glow_bg", { opacity: 0.7, scale: 1.8, filter: "blur(80px)", duration: 0.5 }, 0.25);
    shopTL.to(".glass_box", { scale: 1.04, z: 80, duration: 0.8, ease: "power3.out" }, 0.25);
  }

  /* =========================================================
   * 13. 커서 UI
   * ========================================================= */
  document.body.insertAdjacentHTML("beforeend", `<div class="cursor-ring" id="cursorRing">ENTER ↗</div><div class="cursor-dot" id="cursorDot"></div>`);

  const ring = document.getElementById("cursorRing");
  const dot = document.getElementById("cursorDot");
  let mx = 0, my = 0, rx = window.innerWidth / 2, ry = window.innerHeight / 2;

  document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; } });
  (function lerpRing() { rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1; if (ring) { ring.style.left = rx + "px"; ring.style.top = ry + "px"; } requestAnimationFrame(lerpRing); })();

  const glassBox = qs(".glass_box");
  if (glassBox && ring && dot) {
    glassBox.addEventListener("mouseenter", () => { ring.classList.add("shop-hover"); dot.style.opacity = "0"; });
    glassBox.addEventListener("mouseleave", () => { ring.classList.remove("shop-hover"); dot.style.opacity = "1"; });
  }
  if (glassBox) {
    glassBox.addEventListener("mousemove", (e) => {
      const rect = glassBox.getBoundingClientRect();
      gsap.to(glassBox, { x: (e.clientX - rect.left - rect.width / 2) * 0.08, y: (e.clientY - rect.top - rect.height / 2) * 0.08, duration: 0.5, ease: "power2.out" });
    });
    glassBox.addEventListener("mouseleave", () => { gsap.to(glassBox, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" }); });
  }

  let isInNews = false, isOnTopBtn = false;
  document.addEventListener("mousedown", () => dot.classList.add("orange"));
  document.addEventListener("mouseup", () => { if (!isInNews && !isOnTopBtn) dot.classList.remove("orange"); });

  const newsSection = qs(".news");
  if (newsSection) {
    newsSection.addEventListener("mouseenter", () => { isInNews = true; dot.classList.add("orange"); });
    newsSection.addEventListener("mouseleave", () => { isInNews = false; dot.classList.remove("orange"); });
  }

  const topBtn = qs(".top_btn");
  if (topBtn) {
    topBtn.addEventListener("mouseenter", () => { isOnTopBtn = true; dot.classList.add("orange"); });
    topBtn.addEventListener("mouseleave", () => { isOnTopBtn = false; dot.classList.remove("orange"); });
  }

  const scrollIndicator = document.querySelector('.scroll_indicator');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) { scrollIndicator.classList.add('hidden'); }
    else { scrollIndicator.classList.remove('hidden'); }
  });

  document.querySelectorAll('[data-cursor="light"]').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.classList.add('orange'); dot.classList.add('orange'); });
    el.addEventListener('mouseleave', () => { ring.classList.remove('orange'); dot.classList.remove('orange'); });
  });

  window.addEventListener("resize", () => ScrollTrigger.refresh());
});