document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
   * 1. 기본 DOM / 라이브러리 체크
   * ========================================================= */
  const cube = document.getElementById("cube");
  const cubeStage = document.querySelector(".cube_stage");
  const introScene = document.querySelector(".intro_scene");
  const museumWrap = document.getElementById("museumWrap");
  const museumSections = document.querySelectorAll(".museum_exhibit_section");
  const horizontalSections = document.querySelectorAll(
    ".museum_exhibit_section.is_horizontal"
  );
  const cubeFaces = document.querySelectorAll(".cube_face");
  const topBtn = document.querySelector(".top_btn a");
  const topBtnWrap = document.querySelector(".top_btn");

  if (
    typeof Lenis === "undefined" ||
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined"
  ) {
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
  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* =========================================================
   * 3. 전역 상태값
   * ========================================================= */
  let isTransitioning = false;
  let hasTriggeredExpand = false;
  let isMuseumReady = false;
  let horizontalRafId = null;
  let cubeScrollTrigger = null;

  const currentX = new WeakMap();

  // 태블릿 여부 체크
  const isTablet = () => window.innerWidth <= 1024;

  /* =========================================================
   * 4. 공통 유틸
   * ========================================================= */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function hideAllMuseumSections() {
    museumSections.forEach((section) => section.classList.remove("active"));
  }

  function cancelHorizontalAnimation() {
    if (horizontalRafId) {
      cancelAnimationFrame(horizontalRafId);
      horizontalRafId = null;
    }
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
   * 6. 가로 스크롤 목표값 계산 (데스크톱 전용)
   * ========================================================= */
  function getTargetX(section) {
    if (isTablet()) return 0; // 태블릿에선 비활성화

    const track = section.querySelector(".museum_h_track");
    if (!track) return 0;

    const sectionTop = getAbsoluteTop(section);
    const rawProgress = Math.max(window.scrollY - sectionTop, 0);
    const maxTranslate = Math.max(track.scrollWidth - window.innerWidth, 0);
    const startHold = 600;

    let targetX = rawProgress <= startHold ? 0 : rawProgress - startHold;
    return Math.max(0, Math.min(targetX, maxTranslate));
  }

  /* =========================================================
   * 7. 전시 헤더 압축 상태 제어
   * ========================================================= */
  function updateCompactHeader() {
    horizontalSections.forEach((section) => {
      if (!section.classList.contains("active")) {
        section.classList.remove("is_compact");
        return;
      }
      const sectionTop = getAbsoluteTop(section);
      const scrolled = window.scrollY - sectionTop;
      if (scrolled > 40) {
        section.classList.add("is_compact");
      } else {
        section.classList.remove("is_compact");
      }
    });
  }

  /* =========================================================
   * 8. 가로 스크롤 애니메이션 (데스크톱 전용)
   * ========================================================= */
  function animateHorizontal() {
    if (!isMuseumReady || isTablet()) {
      horizontalRafId = null;
      return;
    }

    let stillMoving = false;

    horizontalSections.forEach((section) => {
      if (!section.classList.contains("active")) return;

      const track = section.querySelector(".museum_h_track");
      if (!track) return;

      const target = getTargetX(section);
      const current = currentX.has(section) ? currentX.get(section) : 0;
      const next = lerp(current, target, 0.12);

      currentX.set(section, next);
      track.style.transform = `translate3d(${-next}px, 0, 0)`;

      if (Math.abs(next - target) > 0.3) stillMoving = true;
    });

    updateCompactHeader();
    horizontalRafId = stillMoving ? requestAnimationFrame(animateHorizontal) : null;
  }

  /* =========================================================
   * 9. 섹션 높이 세팅
   * - 태블릿: 100vh 고정 (스와이프 전용)
   * - 데스크톱: 스크롤 길이만큼 높이 확보
   * ========================================================= */
  function setupHorizontalSections(callback) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        horizontalSections.forEach((section) => {
          if (!section.classList.contains("active")) return;

          const track = section.querySelector(".museum_h_track");
          if (!track) return;

          resetHorizontalSection(section);

          if (isTablet()) {
            // 태블릿: 높이 고정, 스크롤 기반 이동 없음
            section.style.height = `100vh`;
          } else {
            const totalScrollX = Math.max(track.scrollWidth - window.innerWidth, 0);
            const startHold = 600;
            const extraScroll = window.innerWidth <= 1440 ? 80 : 1600;
            section.style.height = `${
              window.innerHeight + totalScrollX + startHold + extraScroll
            }px`;
          }
        });

        if (typeof callback === "function") callback();
      });
    });
  }

  /* =========================================================
   * 10. 큐브 → 전시 섹션 전환
   * ========================================================= */
  function switchToMuseum(targetSection) {
    isMuseumReady = false;
    cancelHorizontalAnimation();

    if (cubeScrollTrigger) {
      cubeScrollTrigger.kill();
      cubeScrollTrigger = null;
    }

    museumWrap.classList.add("active");
    hideAllMuseumSections();
    targetSection.classList.add("active");
    targetSection.classList.remove("is_compact");

    if (topBtnWrap) topBtnWrap.classList.add("active");

    setupHorizontalSections(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resetAllHorizontalSections();
          resetHorizontalSection(targetSection);
          ScrollTrigger.refresh();

          const targetTop = getAbsoluteTop(targetSection);
          window.scrollTo(0, targetTop);
          lenis.scrollTo(targetTop, { immediate: true });

          introScene.classList.add("is_leaving");

          gsap.to(introScene, {
            opacity: 0,
            duration: 0.55,
            ease: "power2.out",
            onComplete() {
              introScene.style.display = "none";
              introScene.classList.remove("is_leaving");
              introScene.style.opacity = "";

              resetHorizontalSection(targetSection);
              updateCompactHeader();

              isMuseumReady = true;
              isTransitioning = false;
              lenis.start();

              // 데스크톱만 가로 RAF 시작
              if (!isTablet() && !horizontalRafId) {
                horizontalRafId = requestAnimationFrame(animateHorizontal);
              }
            },
          });
        });
      });
    });
  }

  /* =========================================================
   * 11. 선택한 큐브 면 확대
   * ========================================================= */
  function expandSelectedFace(face) {
    const targetId = face.dataset.target;
    const targetSection = document.getElementById(targetId);

    if (!targetSection) {
      lenis.start();
      isTransitioning = false;
      return;
    }

    if (cubeScrollTrigger) {
      cubeScrollTrigger.kill();
      cubeScrollTrigger = null;
    }

    cubeFaces.forEach((item) => item.classList.remove("is_active", "is_hidden"));
    face.classList.add("is_active");
    cubeFaces.forEach((item) => {
      if (item !== face) item.classList.add("is_hidden");
    });

    if (window.innerWidth <= 1440) {
      gsap.to(introScene, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete() {
          switchToMuseum(targetSection);
        }
      });
      return;
    }

    const rotateY = getFaceRotation(targetId);
    const tl = gsap.timeline();

    tl.to(cube, { rotateY, duration: 0.9, ease: "power2.inOut" })
      .to(cubeStage, {
        scale: Math.max(window.innerWidth / 1000, window.innerHeight / 560) * 1.1,
        y: -20,
        duration: 1.5,
        ease: "power3.out",
      }, "-=0.1")
      .to(introScene, { opacity: 0.35, duration: 0.7, ease: "power2.out" }, "-=0.75")
      .call(() => switchToMuseum(targetSection));
  }

  /* =========================================================
   * 12. 자동 진입
   * ========================================================= */
  function triggerAutoExpand() {
    if (isTransitioning || hasTriggeredExpand) return;
    hasTriggeredExpand = true;
    isTransitioning = true;

    const seoulFace = document.querySelector('[data-target="seoul"]');
    if (!seoulFace) {
      isTransitioning = false;
      return;
    }

    lenis.stop();
    expandSelectedFace(seoulFace);
  }

  /* =========================================================
   * 13. 큐브 스크롤 인터랙션
   * ========================================================= */
  function initCubeScrollTrigger() {
    if (cubeScrollTrigger) {
      cubeScrollTrigger.kill();
      cubeScrollTrigger = null;
    }

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
          const spinProgress = p / 0.8;
          const easedSpin = 1 - Math.pow(1 - spinProgress, 3);
          rotation = easedSpin * 540;
        } else {
          const settleProgress = (p - 0.8) / 0.2;
          rotation = 540 + (720 - 540) * settleProgress;
        }

        gsap.set(cube, { rotateY: rotation });
        gsap.set(cubeStage, { scale: 1, opacity: 1 });

        if (p >= 0.95 && !hasTriggeredExpand) {
          triggerAutoExpand();
        }
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

    isTransitioning = false;
    hasTriggeredExpand = false;

    gsap.set(cube, { rotateY: 0 });
    gsap.set(cubeStage, { scale: 1, opacity: 1, clearProps: "transform,opacity" });

    introScene.style.display = "";
    introScene.classList.remove("is_leaving");
    gsap.set(introScene, { opacity: 1, clearProps: "opacity" });

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
   * 16. 전시 섹션 스크롤 이벤트 (데스크톱 전용)
   * ========================================================= */
  window.addEventListener(
    "scroll",
    () => {
      if (!isMuseumReady || isTablet()) return;
      if (!horizontalRafId) {
        horizontalRafId = requestAnimationFrame(animateHorizontal);
      }
      updateCompactHeader();
    },
    { passive: true }
  );

  /* =========================================================
   * 17. 리사이즈 대응
   * ========================================================= */
  window.addEventListener("resize", () => {
    if (!museumWrap.classList.contains("active")) return;

    setupHorizontalSections(() => {
      horizontalSections.forEach((section) => {
        if (section.classList.contains("active")) {
          resetHorizontalSection(section);
        }
      });

      updateCompactHeader();

      if (!isTablet() && isMuseumReady && !horizontalRafId) {
        horizontalRafId = requestAnimationFrame(animateHorizontal);
      }

      ScrollTrigger.refresh();
    });
  });

  /* =========================================================
   * 18. 탑 버튼 클릭 시 큐브로 복귀
   * ========================================================= */
  if (topBtn) {
    topBtn.addEventListener("click", (e) => {
      e.preventDefault();
      returnToCube();
    });
  }

  /* =========================================================
   * 19. 큐브 면 클릭 시 해당 전시로 진입
   * ========================================================= */
  cubeFaces.forEach((face) => {
    face.addEventListener("click", () => {
      if (isTransitioning) return;
      isTransitioning = true;
      hasTriggeredExpand = true;
      lenis.stop();
      expandSelectedFace(face);
    });
  });

  /* =========================================================
   * 20. 헤더 스크롤 숨김
   * ========================================================= */
  const header = document.querySelector(".header");

  if (header) {
    header.style.transition = "transform 0.35s ease";
    let lastScrollY = 0;

    lenis.on("scroll", ({ scroll }) => {
      if (isTransitioning) return;
      if (scroll > lastScrollY && scroll > 80) {
        header.style.transform = "translateY(-100%)";
      } else {
        header.style.transform = "translateY(0)";
      }
      lastScrollY = scroll;
    });
  }

  /* =========================================================
   * 21. 큐브 커서 호버 효과
   * ========================================================= */
  if (window.innerWidth > 1024) {
    cubeFaces.forEach((face) => {
      face.addEventListener('mouseenter', () => {
        const cursorRing = document.getElementById('cursorRing');
        if (cursorRing) {
          cursorRing.classList.add('cube-hover');
          cursorRing.textContent = 'CLICK HERE !';
        }
      });
      face.addEventListener('mouseleave', () => {
        const cursorRing = document.getElementById('cursorRing');
        if (cursorRing) {
          cursorRing.classList.remove('cube-hover');
          cursorRing.textContent = '';
        }
      });
    });
  }

  /* =========================================================
   * 22. 모바일 슬라이드 모드 (1024px 이하)
   * ========================================================= */
  function initMobileSlide() {
    if (window.innerWidth > 1024) return;

    const cubeEl = document.getElementById('cube');
    const cubePinEl = document.querySelector('.cube_pin');
    if (!cubeEl || !cubePinEl) return;

    cubeEl.classList.add('is_slide_mode');

    let currentIndex = 0;
    const faces = Array.from(cubeFaces);
    const total = faces.length;

    const dots = document.createElement('div');
    dots.className = 'slide_dots';
    faces.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('is_active');
      dot.addEventListener('click', () => goTo(i));
      dots.appendChild(dot);
    });
    cubePinEl.appendChild(dots);

    const prevBtn = document.createElement('button');
    prevBtn.className = 'slide_prev';
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'slide_next';
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';

    cubePinEl.appendChild(prevBtn);
    cubePinEl.appendChild(nextBtn);

    function goTo(index) {
      currentIndex = (index + total) % total;
      cubeEl.style.transform = `translateX(-${currentIndex * 100}vw)`;
      document.querySelectorAll('.slide_dots span').forEach((d, i) => {
        d.classList.toggle('is_active', i === currentIndex);
      });
    }

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    let startX = 0;
    cubeEl.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    cubeEl.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
      }
    }, { passive: true });
  }

  if (window.innerWidth <= 1024) {
    initMobileSlide();
  }

  /* =========================================================
   * 23. 태블릿 전시 카드 스와이프 (1024px 이하 전용)
   * - 스크롤 기반 이동 완전 비활성화
   * - 터치 스와이프로만 카드 이동
   * ========================================================= */
  function initCardSwipe() {
    if (!isTablet()) return;

    horizontalSections.forEach((section) => {
      const track = section.querySelector('.museum_h_track');
      if (!track) return;

      let startX = 0;
      let startTranslate = 0;
      let isDragging = false;

      track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startTranslate = currentX.has(section) ? currentX.get(section) : 0;
        isDragging = true;
      }, { passive: true });

      track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const diff = startX - e.touches[0].clientX;
        const maxTranslate = Math.max(track.scrollWidth - window.innerWidth, 0);
        const next = Math.max(0, Math.min(startTranslate + diff, maxTranslate));
        track.style.transform = `translate3d(${-next}px, 0, 0)`;
      }, { passive: true });

      track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;

        const diff = startX - e.changedTouches[0].clientX;
        const maxTranslate = Math.max(track.scrollWidth - window.innerWidth, 0);
        const cardWidth = window.innerWidth;
        const currentVal = currentX.has(section) ? currentX.get(section) : 0;

        let newVal = currentVal;
        if (Math.abs(diff) > 50) {
          newVal = diff > 0
            ? Math.min(currentVal + cardWidth, maxTranslate)
            : Math.max(currentVal - cardWidth, 0);
        } else {
          // 조금 움직이다 손 뗀 경우 원래 위치로 스냅
          newVal = currentVal;
        }

        currentX.set(section, newVal);

        // 부드러운 스냅 애니메이션
        gsap.to(track, {
          x: -newVal,
          duration: 0.35,
          ease: "power2.out",
        });
      }, { passive: true });
    });
  }

  if (isTablet()) {
    initCardSwipe();
  }

});