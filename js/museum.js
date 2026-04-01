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

  /* =========================================================
   * 1. 기본 DOM / 라이브러리 체크
   * ========================================================= */
  const cube               = document.getElementById("cube");
  const cubeStage          = document.querySelector(".cube_stage");
  const introScene         = document.querySelector(".intro_scene");
  const museumWrap         = document.getElementById("museumWrap");
  const museumSections     = document.querySelectorAll(".museum_exhibit_section");
  const horizontalSections = document.querySelectorAll(".museum_exhibit_section.is_horizontal");
  const cubeFaces          = document.querySelectorAll(".cube_face");
  const topBtn             = document.querySelector(".top_btn a");
  const topBtnWrap         = document.querySelector(".top_btn");
  const header             = document.querySelector(".header");

  if (typeof Lenis === "undefined" || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.error("[MMCA] Lenis / GSAP / ScrollTrigger 라이브러리를 먼저 로드해주세요.");
    return;
  }
  if (!cube || !cubeStage || !introScene || !museumWrap || !museumSections.length) {
    console.error("[MMCA] 필수 DOM 요소를 찾지 못했습니다.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* =========================================================
   * 2. Lenis 스크롤 세팅
   * ========================================================= */
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* =========================================================
   * 3. 전역 상태값
   * ========================================================= */
  let isTransitioning    = false;
  let hasTriggeredExpand = false;
  let isMuseumReady      = false;
  let horizontalRafId    = null;
  let cubeScrollTrigger  = null;
  const currentX         = new WeakMap();

  /* =========================================================
   * 4. 공통 유틸
   * ========================================================= */
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
      case "seoul":      return 0;
      case "deoksugung": return -90;
      case "gwacheon":   return 180;
      case "cheongju":   return 90;
      default:           return 0;
    }
  }

  /* =========================================================
   * 5. 가로 스크롤 초기화 / 리셋
   * ========================================================= */
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

  /* =========================================================
   * 6. 가로 스크롤 목표값 계산
   * ========================================================= */
  function getTargetX(section) {
    const track = section.querySelector(".museum_h_track");
    if (!track) return 0;
    const sectionTop   = getAbsoluteTop(section);
    const rawProgress  = Math.max(window.scrollY - sectionTop, 0);
    const maxTranslate = Math.max(track.scrollWidth - window.innerWidth, 0);
    const targetX      = rawProgress <= 600 ? 0 : rawProgress - 600;
    return Math.max(0, Math.min(targetX, maxTranslate));
  }

  /* =========================================================
   * 7. 전시 헤더 압축 상태 제어
   * ========================================================= */
  function updateCompactHeader() {
    horizontalSections.forEach((section) => {
      if (!section.classList.contains("active")) { section.classList.remove("is_compact"); return; }
      const scrolled = window.scrollY - getAbsoluteTop(section);
      section.classList.toggle("is_compact", scrolled > 40);
    });
  }

  /* =========================================================
   * 8. 가로 스크롤 애니메이션
   * ========================================================= */
  function animateHorizontal() {
    if (!isMuseumReady) { horizontalRafId = null; return; }
    let stillMoving = false;

    horizontalSections.forEach((section) => {
      if (!section.classList.contains("active")) return;
      const track = section.querySelector(".museum_h_track");
      if (!track) return;
      const target  = getTargetX(section);
      const current = currentX.has(section) ? currentX.get(section) : 0;
      const next    = lerp(current, target, 0.12);
      currentX.set(section, next);
      track.style.transform = `translate3d(${-next}px, 0, 0)`;
      if (Math.abs(next - target) > 0.3) stillMoving = true;
    });

    updateCompactHeader();
    horizontalRafId = stillMoving ? requestAnimationFrame(animateHorizontal) : null;
  }

  /* =========================================================
   * 9. 가로 스크롤 섹션 높이 세팅
   * ========================================================= */
  function setupHorizontalSections(callback) {
    // rAF 없이 동기적으로 높이 계산 → 타이밍 지연 없음
    horizontalSections.forEach((section) => {
      if (!section.classList.contains("active")) return;
      const track = section.querySelector(".museum_h_track");
      if (!track) return;
      resetHorizontalSection(section);
      const totalScrollX = Math.max(track.scrollWidth - window.innerWidth, 0);
      section.style.height = `${window.innerHeight + totalScrollX + 600 + 120}px`;
    });
    if (typeof callback === "function") callback();
  }

  /* =========================================================
   * 10. 큐브 → 전시 섹션 전환
   *
   * [핵심 수정] 순서를 바꿈:
   *   기존: 페이드아웃 끝 → 레이아웃 세팅 → 스크롤 이동
   *   변경: introScene 즉시 숨김 → 레이아웃 세팅 → 스크롤 이동 → museumWrap 표시
   *
   * 페이드아웃 애니메이션이 끝나기를 기다리는 동안 브라우저가
   * 엉뚱한 스크롤 위치(푸터)를 잠깐 보여주는 문제를 제거.
   * ========================================================= */
  function switchToMuseum(targetSection) {
    isMuseumReady = false;
    cancelHorizontalAnimation();
    if (cubeScrollTrigger) { cubeScrollTrigger.kill(); cubeScrollTrigger = null; }

    // 1) introScene 즉시 제거 + 동기적으로 scroll 0 고정
    //    → display:none 으로 페이지 높이가 줄어드는 순간
    //      브라우저가 스크롤을 푸터로 튕기는 것을 막음
    introScene.style.display = "none";
    introScene.style.opacity = "";
    introScene.classList.remove("is_leaving");
    window.scrollTo(0, 0);                        // ★ 동기 즉시 고정
    lenis.scrollTo(0, { immediate: true });

    // 2) museumWrap / 섹션 활성화
    museumWrap.classList.add("active");
    hideAllMuseumSections();
    targetSection.classList.add("active");
    targetSection.classList.remove("is_compact");
    if (topBtnWrap) topBtnWrap.classList.add("active");

    // 3) 섹션 높이 세팅 → ScrollTrigger 갱신 → 정확한 위치로 최종 스크롤
    setupHorizontalSections(() => {
      resetAllHorizontalSections();
      resetHorizontalSection(targetSection);
      ScrollTrigger.refresh();

      requestAnimationFrame(() => {
        const targetTop = getAbsoluteTop(targetSection);
        window.scrollTo(0, targetTop);
        lenis.scrollTo(targetTop, { immediate: true });

        updateCompactHeader();
        resetHorizontalSection(targetSection);

        isMuseumReady   = true;
        isTransitioning = false;
        lenis.start();

        if (!horizontalRafId) {
          horizontalRafId = requestAnimationFrame(animateHorizontal);
        }
      });
    });
  }

  /* =========================================================
   * 11. 선택한 큐브 면 확대
   *
   * [핵심 수정] 페이드아웃을 switchToMuseum과 병렬로 실행.
   *   기존: 페이드아웃 onComplete 콜백 안에서 switchToMuseum 호출
   *         → 애니메이션 끝날 때까지 스크롤 이동이 지연됨
   *   변경: switchToMuseum 먼저 호출(레이아웃·스크롤 즉시 처리),
   *         페이드아웃은 별도로 동시에 실행
   * ========================================================= */
  function expandSelectedFace(face) {
    const targetId      = face.dataset.target;
    const targetSection = document.getElementById(targetId);

    if (!targetSection) { lenis.start(); isTransitioning = false; return; }
    if (cubeScrollTrigger) { cubeScrollTrigger.kill(); cubeScrollTrigger = null; }

    cubeFaces.forEach((item) => item.classList.remove("is_active", "is_hidden"));
    face.classList.add("is_active");
    cubeFaces.forEach((item) => { if (item !== face) item.classList.add("is_hidden"); });

    if (window.innerWidth <= 1440) {
      // 스크롤·레이아웃을 먼저, 페이드아웃은 동시에
      switchToMuseum(targetSection);
      gsap.fromTo(introScene,
        { opacity: 1 },
        { opacity: 0, duration: 0.35, ease: "power2.out" }
      );
      return;
    }

    // 1440px 초과: 큐브 확대 애니 → 페이드아웃과 switchToMuseum 병렬 실행
    const rotateY = getFaceRotation(targetId);
    gsap.timeline()
      .to(cube, { rotateY, duration: 0.9, ease: "power2.inOut" })
      .to(cubeStage, {
        scale: Math.max(window.innerWidth / 1000, window.innerHeight / 560) * 1.1,
        y: -20,
        duration: 1.5,
        ease: "power3.out",
      }, "-=0.1")
      .to(introScene, { opacity: 0, duration: 0.7, ease: "power2.out" }, "-=0.75")
      .call(() => { switchToMuseum(targetSection); });
  }

  /* =========================================================
   * 12. 자동 진입
   * ========================================================= */
  function triggerAutoExpand() {
    if (isTransitioning || hasTriggeredExpand) return;
    hasTriggeredExpand = true;
    isTransitioning    = true;
    const seoulFace = document.querySelector('[data-target="seoul"]');
    if (!seoulFace) { isTransitioning = false; return; }
    lenis.stop();
    expandSelectedFace(seoulFace);
  }

  /* =========================================================
   * 13. 큐브 스크롤 인터랙션
   * ========================================================= */
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

  /* =========================================================
   * 14. 전시 → 다시 큐브로 복귀
   * ========================================================= */
  function returnToCube() {
    isMuseumReady = false;
    cancelHorizontalAnimation();

    museumWrap.classList.remove("active");
    hideAllMuseumSections();
    if (topBtnWrap) topBtnWrap.classList.remove("active");

    horizontalSections.forEach((section) => {
      resetHorizontalSection(section);
      section.style.height = "";
      section.classList.remove("is_compact");
      currentX.delete(section);
    });

    cubeFaces.forEach((face) => face.classList.remove("is_active", "is_hidden"));
    isTransitioning    = false;
    hasTriggeredExpand = false;

    gsap.set(cube, { rotateY: 0 });
    gsap.set(cubeStage, { scale: 1, opacity: 1, clearProps: "transform,opacity" });

    introScene.style.display = "";
    introScene.style.opacity = "";
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

  /* =========================================================
   * 15. 초기 실행
   * ========================================================= */
  initCubeScrollTrigger();

  /* =========================================================
   * 16. 전시 섹션 스크롤 이벤트
   * ========================================================= */
  window.addEventListener("scroll", () => {
    if (!isMuseumReady) return;
    if (!horizontalRafId) horizontalRafId = requestAnimationFrame(animateHorizontal);
    updateCompactHeader();
  }, { passive: true });

  /* =========================================================
   * 17. 리사이즈 대응
   * ========================================================= */
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

  /* =========================================================
   * 18. 탑 버튼 클릭 시 큐브로 복귀
   * ========================================================= */
  if (topBtn) {
    topBtn.addEventListener("click", (e) => { e.preventDefault(); returnToCube(); });
  }

  /* =========================================================
   * 19. 큐브 면 클릭 시 해당 전시로 진입
   * ========================================================= */
  cubeFaces.forEach((face) => {
    face.addEventListener("click", () => {
      if (isTransitioning) return;
      isTransitioning    = true;
      hasTriggeredExpand = true;
      lenis.stop();
      expandSelectedFace(face);
    });
  });

  /* =========================================================
   * 20. 헤더 스크롤 숨김
   * ========================================================= */
  if (header) {
    header.style.transition = "transform 0.35s ease";
    let lastScrollY = 0;
    lenis.on("scroll", ({ scroll }) => {
      if (isTransitioning) return;
      header.style.transform = (scroll > lastScrollY && scroll > 80) ? "translateY(-100%)" : "translateY(0)";
      lastScrollY = scroll;
    });
  }

  /* =========================================================
   * 21. 큐브 커서 호버 효과
   * ========================================================= */
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

  /* =========================================================
   * 22. 모바일 슬라이드 모드 (1024px 이하)
   * ========================================================= */
  function initMobileSlide() {
    if (window.innerWidth > 1024) return;
    const cubeEl    = document.getElementById("cube");
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

  /* =========================================================
   * 23. 외부 해시 링크로 진입 시 해당 섹션으로 바로 이동
   * ========================================================= */
  const hashTarget = window.location.hash?.replace("#", "");
  if (hashTarget) {
    const targetSection = document.getElementById(hashTarget);
    if (targetSection) {
      isTransitioning    = true;
      hasTriggeredExpand = true;
      lenis.stop();
      const targetFace = document.querySelector(`[data-target="${hashTarget}"]`);
      if (targetFace) expandSelectedFace(targetFace);
      else switchToMuseum(targetSection);
    }
  }

  /* =========================================================
   * 24. 커스텀 커서
   * ========================================================= */
  (function initCursor() {
    if (window.innerWidth <= 480) return;
    document.body.insertAdjacentHTML("beforeend",
      `<div class="cursor-ring" id="cursorRing"></div><div class="cursor-dot" id="cursorDot"></div>`
    );
    const ring = document.getElementById("cursorRing");
    const dot  = document.getElementById("cursorDot");
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
      el.addEventListener("mouseenter", () => { isInLight = true;  dot.classList.add("orange");    ring.classList.add("orange"); });
      el.addEventListener("mouseleave", () => { isInLight = false; dot.classList.remove("orange"); ring.classList.remove("orange"); });
    });

    document.addEventListener("mousedown", () => dot.classList.add("orange"));
    document.addEventListener("mouseup",   () => { if (!isInLight) dot.classList.remove("orange"); });
  })();

});