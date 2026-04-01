document.addEventListener("DOMContentLoaded", () => {

  const isMobile480 = window.innerWidth <= 480;

  if (isMobile480) {
    const slides = document.querySelectorAll(".museum_mobile_slide");
    const sections = document.querySelectorAll(".museum_wrap .museum_exhibit_section[data-museum-section]");

    function changeMuseum(targetMuseum) {
      slides.forEach((slide) => {
        slide.classList.toggle("is_active", slide.dataset.museum === targetMuseum);
      });
      sections.forEach((section) => {
        section.classList.toggle(
          "is_mobile_active",
          section.dataset.museumSection === targetMuseum
        );
      });
    }

    slides.forEach((slide) => {
      slide.addEventListener("click", () => {
        changeMuseum(slide.dataset.museum);
        slide.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
    });

    changeMuseum("seoul");
    return;
  }

  const cube = document.getElementById("cube");
  const cubeStage = document.querySelector(".cube_stage");
  const introScene = document.querySelector(".intro_scene");
  const museumWrap = document.getElementById("museumWrap");
  const museumSections = document.querySelectorAll(".museum_exhibit_section");
  const horizontalSections = document.querySelectorAll(".museum_exhibit_section.is_horizontal");
  const cubeFaces = document.querySelectorAll(".cube_face");
  const topBtn = document.querySelector(".top_btn a");
  const topBtnWrap = document.querySelector(".top_btn");
  const header = document.querySelector(".header");

  if (typeof Lenis === "undefined" || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.error("[MMCA] Lenis / GSAP / ScrollTrigger 라이브러리를 먼저 로드해주세요.");
    return;
  }
  if (!cube || !cubeStage || !introScene || !museumWrap || !museumSections.length) {
    console.error("[MMCA] 필수 DOM 요소를 찾지 못했습니다.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  let isTransitioning = false;
  let hasTriggeredExpand = false;
  let isMuseumReady = false;
  let horizontalRafId = null;
  let cubeScrollTrigger = null;
  const currentX = new WeakMap();

  const HORIZONTAL_STICKY_TOP = 100;
  const NORMAL_SPEED = 0.95;
  const LAST_CARD_SPEED = 0.92;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function hideAllMuseumSections() {
    museumSections.forEach((s) => s.classList.remove("active"));
  }

  function cancelHorizontalAnimation() {
    if (horizontalRafId) { cancelAnimationFrame(horizontalRafId); horizontalRafId = null; }
  }

  function getAbsoluteTop(el) {
    return el.getBoundingClientRect().top + window.scrollY;
  }

  function getFaceRotation(targetId) {
    switch (targetId) {
      case "seoul": return 0;
      case "deoksugung": return -90;
      case "gwacheon": return 180;
      case "cheongju": return 90;
      default: return 0;
    }
  }

  function resetHorizontalSection(section) {
    if (!section) return;
    const track = section.querySelector(".museum_h_track");
    if (!track) return;
    track.style.transform = "translate3d(0, 0, 0)";
    currentX.set(section, 0);
  }

  function resetAllHorizontalSections() {
    horizontalSections.forEach((section) => {
      const track = section.querySelector(".museum_h_track");
      if (!track) return;
      track.style.transform = "translate3d(0, 0, 0)";
      currentX.set(section, 0);
      section.classList.remove("is_compact");
    });
  }

  function syncHorizontalLayout(section) {
    if (!section) return;
    const head = section.querySelector(".museum_head");
    if (!head) return;

    const stickyHeight = Math.max(window.innerHeight - HORIZONTAL_STICKY_TOP, 0);
    const headHeight = Math.ceil(head.getBoundingClientRect().height);
    section.style.setProperty("--museum-sticky-top", `${HORIZONTAL_STICKY_TOP}px`);
    section.style.setProperty("--museum-sticky-height", `${stickyHeight}px`);
    section.style.setProperty("--museum-head-height", `${headHeight}px`);
  }

  function getHorizontalMetrics(section) {
    const track = section.querySelector(".museum_h_track");
    if (!track) return null;

    const maxTranslate = Math.max(track.scrollWidth - window.innerWidth, 0);
    const lastCardSpan = Math.min(window.innerWidth, maxTranslate);
    const lastCardStart = Math.max(maxTranslate - lastCardSpan, 0);

    return { track, maxTranslate, lastCardSpan, lastCardStart };
  }

  function getTargetX(section) {
    const metrics = getHorizontalMetrics(section);
    if (!metrics) return 0;

    const sectionTop = getAbsoluteTop(section);
    const rawProgress = Math.max(window.scrollY - sectionTop, 0);
    const { maxTranslate, lastCardStart } = metrics;
    const normalProgress = rawProgress * NORMAL_SPEED;

    if (normalProgress > lastCardStart) {
      const slow = lastCardStart + (normalProgress - lastCardStart) * LAST_CARD_SPEED;
      return Math.max(0, Math.min(slow, maxTranslate));
    }
    return Math.max(0, Math.min(normalProgress, maxTranslate));
  }

  function getHorizontalScrollHeight(section) {
    const metrics = getHorizontalMetrics(section);
    if (!metrics || metrics.maxTranslate === 0) return window.innerHeight;

    // Sticky has a top offset, but the containing section still needs full viewport height
    // so the header does not start sliding away before the horizontal motion is complete.
    const normalDistance = metrics.lastCardStart / NORMAL_SPEED;
    const lastCardDistance = metrics.lastCardSpan / (NORMAL_SPEED * LAST_CARD_SPEED);

    return window.innerHeight + normalDistance + lastCardDistance + 600;
  }

  function updateCompactHeader() {
    horizontalSections.forEach((section) => {
      section.classList.remove("is_compact");
    });
  }

  function animateHorizontal() {
    if (!isMuseumReady) { horizontalRafId = null; return; }
    let stillMoving = false;

    horizontalSections.forEach((section) => {
      if (!section.classList.contains("active")) return;
      const track = section.querySelector(".museum_h_track");
      if (!track) return;
      const target = getTargetX(section);
      const current = currentX.has(section) ? currentX.get(section) : 0;
      const next = lerp(current, target, 0.28);
      currentX.set(section, next);
      track.style.transform = `translate3d(${-next}px, 0, 0)`;
      if (Math.abs(next - target) > 0.3) stillMoving = true;
    });

    updateCompactHeader();
    horizontalRafId = stillMoving ? requestAnimationFrame(animateHorizontal) : null;
  }

  function setupHorizontalSections(callback) {
    horizontalSections.forEach((section) => {
      if (!section.classList.contains("active")) return;
      const track = section.querySelector(".museum_h_track");
      if (!track) return;
      syncHorizontalLayout(section);
      resetHorizontalSection(section);
      const totalHeight = getHorizontalScrollHeight(section);
      section.style.height = `${totalHeight}px`;

      const inner = section.querySelector(".museum_inner");
      if (inner) inner.style.height = `${totalHeight}px`;
    });
    if (typeof callback === "function") callback();
  }

  function switchToMuseum(targetSection) {
    isMuseumReady = false;
    cancelHorizontalAnimation();
    if (cubeScrollTrigger) { cubeScrollTrigger.kill(); cubeScrollTrigger = null; }

    lenis.stop();
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    introScene.style.display = "none";
    introScene.style.opacity = "";
    introScene.style.pointerEvents = "";
    introScene.classList.remove("is_leaving");

    museumWrap.classList.add("active");
    hideAllMuseumSections();
    targetSection.classList.add("active");
    targetSection.classList.remove("is_compact");
    if (topBtnWrap) topBtnWrap.classList.add("active");

    setupHorizontalSections(() => {
      resetAllHorizontalSections();
      resetHorizontalSection(targetSection);

      const targetTop = Math.max(getAbsoluteTop(targetSection) - HORIZONTAL_STICKY_TOP, 0);

      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";

      window.scrollTo(0, targetTop);
      lenis.scrollTo(targetTop, { immediate: true });

      updateCompactHeader();
      resetHorizontalSection(targetSection);

      isMuseumReady = true;
      isTransitioning = false;
      lenis.start();

      if (!horizontalRafId) {
        horizontalRafId = requestAnimationFrame(animateHorizontal);
      }
    });
  }

  function expandSelectedFace(face) {
    const targetId = face.dataset.target;
    const targetSection = document.getElementById(targetId);

    if (!targetSection) { lenis.start(); isTransitioning = false; return; }
    if (cubeScrollTrigger) { cubeScrollTrigger.kill(); cubeScrollTrigger = null; }

    cubeFaces.forEach((item) => item.classList.remove("is_active", "is_hidden"));
    face.classList.add("is_active");
    cubeFaces.forEach((item) => { if (item !== face) item.classList.add("is_hidden"); });

    if (window.innerWidth <= 1440) {
      switchToMuseum(targetSection);
      gsap.fromTo(introScene,
        { opacity: 1 },
        { opacity: 0, duration: 0.35, ease: "power2.out" }
      );
      return;
    }

    const rotateY = getFaceRotation(targetId);
    gsap.timeline({
      onStart: () => { switchToMuseum(targetSection); }
    })
      .to(cube, { rotateY, duration: 0.9, ease: "power2.inOut" })
      .to(cubeStage, {
        scale: Math.max(window.innerWidth / 1000, window.innerHeight / 560) * 1.1,
        y: -20,
        duration: 1.5,
        ease: "power3.out",
      }, "-=0.1")
      .to(introScene, { opacity: 0, duration: 0.7, ease: "power2.out" }, "-=0.75");
  }

  function triggerAutoExpand() {
    if (isTransitioning || hasTriggeredExpand) return;
    hasTriggeredExpand = true;
    isTransitioning = true;
    const seoulFace = document.querySelector('[data-target="seoul"]');
    if (!seoulFace) { isTransitioning = false; return; }
    lenis.stop();
    expandSelectedFace(seoulFace);
  }

  function initCubeScrollTrigger() {
    if (cubeScrollTrigger) { cubeScrollTrigger.kill(); cubeScrollTrigger = null; }

    cubeScrollTrigger = ScrollTrigger.create({
      trigger: introScene,
      start: "top top",
      end: "+=400%",
      scrub: 2,
      onUpdate(self) {
        if (isTransitioning) return;
        const p = self.progress;
        let rotation;
        if (p < 0.8) {
          rotation = (1 - Math.pow(1 - p / 0.8, 3)) * 540;
        } else {
          rotation = 540 + ((p - 0.8) / 0.2) * 180;
        }
        gsap.set(cube, { rotateY: rotation });
        gsap.set(cubeStage, { scale: 1, opacity: 1 });
        if (p >= 0.95 && !hasTriggeredExpand) triggerAutoExpand();
      },
    });
  }

  function returnToCube() {
    isMuseumReady = false;
    cancelHorizontalAnimation();

    museumWrap.classList.remove("active");
    hideAllMuseumSections();
    if (topBtnWrap) topBtnWrap.classList.remove("active");

    horizontalSections.forEach((section) => {
      resetHorizontalSection(section);
      section.style.height = "";
      const inner = section.querySelector(".museum_inner");
      if (inner) inner.style.height = "";
      section.classList.remove("is_compact");
      currentX.delete(section);
    });

    cubeFaces.forEach((face) => face.classList.remove("is_active", "is_hidden"));
    isTransitioning = false;
    hasTriggeredExpand = false;

    gsap.set(cube, { rotateY: 0 });
    gsap.set(cubeStage, { scale: 1, opacity: 1, clearProps: "transform,opacity" });

    introScene.style.display = "";
    introScene.style.opacity = "";
    introScene.style.pointerEvents = "";
    introScene.classList.remove("is_leaving");
    gsap.set(introScene, { clearProps: "opacity" });

    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        initCubeScrollTrigger();
        lenis.start();
      });
    });
  }

  initCubeScrollTrigger();

  window.addEventListener("scroll", () => {
    if (!isMuseumReady) return;
    if (!horizontalRafId) horizontalRafId = requestAnimationFrame(animateHorizontal);
    updateCompactHeader();
  }, { passive: true });

  window.addEventListener("resize", () => {
    if (!museumWrap.classList.contains("active")) return;
    setupHorizontalSections(() => {
      horizontalSections.forEach((section) => {
        if (section.classList.contains("active")) resetHorizontalSection(section);
      });
      updateCompactHeader();
      if (isMuseumReady && !horizontalRafId) horizontalRafId = requestAnimationFrame(animateHorizontal);
      ScrollTrigger.refresh();
    });
  });

  if (topBtn) {
    topBtn.addEventListener("click", (e) => { e.preventDefault(); returnToCube(); });
  }

  cubeFaces.forEach((face) => {
    face.addEventListener("click", () => {
      if (isTransitioning) return;
      isTransitioning = true;
      hasTriggeredExpand = true;
      lenis.stop();
      expandSelectedFace(face);
    });
  });

  if (header) {
    let lastScrollY = 0;
    lenis.on("scroll", ({ scroll }) => {
      if (isTransitioning) return;

      const scrollingDown = scroll > lastScrollY;
      const pastThreshold = scroll > 80;

      if (!isMuseumReady) {
        header.classList.remove("hide");
        lastScrollY = scroll;
        return;
      }

      if (scrollingDown && pastThreshold) {
        header.classList.add("hide");
      } else {
        header.classList.remove("hide");
        // shrink는 common.js가 담당하므로 여기선 건드리지 않음
      }

      lastScrollY = scroll;
    });
  }

  cubeFaces.forEach((face) => {
    face.addEventListener("mouseenter", () => {
      const ring = document.getElementById("cursorRing");
      if (ring) { ring.classList.add("cube-hover"); ring.textContent = "CLICK HERE !"; }
    });
    face.addEventListener("mouseleave", () => {
      const ring = document.getElementById("cursorRing");
      if (ring) { ring.classList.remove("cube-hover"); ring.textContent = ""; }
    });
  });

  function initMobileSlide() {
    if (window.innerWidth > 1024) return;
    const cubeEl = document.getElementById("cube");
    const cubePinEl = document.querySelector(".cube_pin");
    if (!cubeEl || !cubePinEl) return;

    cubeEl.classList.add("is_slide_mode");
    let currentIndex = 0;
    const faces = Array.from(cubeFaces);
    const total = faces.length;

    const dots = document.createElement("div");
    dots.className = "slide_dots";
    faces.forEach((_, i) => {
      const dot = document.createElement("span");
      if (i === 0) dot.classList.add("is_active");
      dot.addEventListener("click", () => goTo(i));
      dots.appendChild(dot);
    });
    cubePinEl.appendChild(dots);

    const prevBtn = document.createElement("button");
    prevBtn.className = "slide_prev";
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    const nextBtn = document.createElement("button");
    nextBtn.className = "slide_next";
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    cubePinEl.appendChild(prevBtn);
    cubePinEl.appendChild(nextBtn);

    function goTo(index) {
      currentIndex = (index + total) % total;
      cubeEl.style.transform = `translateX(-${currentIndex * 100}vw)`;
      document.querySelectorAll(".slide_dots span").forEach((dot, i) => {
        dot.classList.toggle("is_active", i === currentIndex);
      });
    }

    prevBtn.addEventListener("click", () => goTo(currentIndex - 1));
    nextBtn.addEventListener("click", () => goTo(currentIndex + 1));

    let startX = 0;
    cubeEl.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    cubeEl.addEventListener("touchend", (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
    }, { passive: true });
  }

  if (window.innerWidth <= 1024) initMobileSlide();

  const hashTarget = window.location.hash?.replace("#", "");
  if (hashTarget) {
    const targetSection = document.getElementById(hashTarget);
    if (targetSection) {
      isTransitioning = true;
      hasTriggeredExpand = true;
      lenis.stop();
      const targetFace = document.querySelector(`[data-target="${hashTarget}"]`);
      if (targetFace) expandSelectedFace(targetFace);
      else switchToMuseum(targetSection);
    }
  }

  (function initCursor() {
    if (window.innerWidth <= 480) return;
    document.body.insertAdjacentHTML("beforeend",
      `<div class="cursor-ring" id="cursorRing"></div><div class="cursor-dot" id="cursorDot"></div>`
    );
    const ring = document.getElementById("cursorRing");
    const dot = document.getElementById("cursorDot");
    let mx = 0, my = 0, rx = window.innerWidth / 2, ry = window.innerHeight / 2;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    });

    (function lerpRing() {
      rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      requestAnimationFrame(lerpRing);
    })();

    let isInLight = false;
    document.querySelectorAll('[data-cursor="light"]').forEach((el) => {
      el.addEventListener("mouseenter", () => { isInLight = true; dot.classList.add("orange"); ring.classList.add("orange"); });
      el.addEventListener("mouseleave", () => { isInLight = false; dot.classList.remove("orange"); ring.classList.remove("orange"); });
    });

    document.addEventListener("mousedown", () => dot.classList.add("orange"));
    document.addEventListener("mouseup", () => { if (!isInLight) dot.classList.remove("orange"); });
  })();

});
