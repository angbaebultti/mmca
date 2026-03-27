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
   * - 부드러운 스크롤과 ScrollTrigger 동기화
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
  let isTransitioning = false; // 큐브 → 전시 전환 중인지
  let hasTriggeredExpand = false; // 자동 확대가 이미 실행됐는지
  let isMuseumReady = false; // 전시 섹션이 활성화되어 가로스크롤 준비가 끝났는지
  let horizontalRafId = null; // 가로스크롤 RAF
  let cubeScrollTrigger = null; // 큐브 ScrollTrigger 인스턴스

  const currentX = new WeakMap(); // 섹션별 현재 가로 이동값 저장

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

  // 큐브 각 면이 정면을 보게 되는 회전값
  function getFaceRotation(targetId) {
    switch (targetId) {
      case "seoul":
        return 0;
      case "deoksugung":
        return -90;
      case "gwacheon":
        return 180;
      case "cheongju":
        return 90;
      default:
        return 0;
    }
  }

  /* =========================================================
   * 5. 가로 스크롤 초기화 / 리셋
   * - 전시 섹션 진입 전후로 track 위치를 초기화
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
 * - 처음만 살짝 고정
 * - 이후엔 자연스럽게 가로 이동
 * ========================================================= */
function getTargetX(section) {
  const track = section.querySelector(".museum_h_track");
  if (!track) return 0;

  const sectionTop = getAbsoluteTop(section);
  const rawProgress = Math.max(window.scrollY - sectionTop, 0);
  const maxTranslate = Math.max(track.scrollWidth - window.innerWidth, 0);

  const startHold = 600; // 처음만 살짝 머무름

  let targetX = 0;

  if (rawProgress <= startHold) {
    targetX = 0;
  } else {
    targetX = rawProgress - startHold;
  }

  return Math.max(0, Math.min(targetX, maxTranslate));
}

  /* =========================================================
   * 7. 전시 헤더 압축 상태 제어
   * - 가로 스크롤이 조금 진행되면 헤더를 compact 상태로 변경
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
   * 8. 가로 스크롤 애니메이션
   * - 실제로 track을 부드럽게 이동시키는 부분
   * ========================================================= */
  function animateHorizontal() {
    if (!isMuseumReady) {
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
 * 9. 가로 스크롤 섹션 높이 세팅
 * - 전체 스크롤 길이를 더 늘리고 싶을 때 여기서 조절
 * ========================================================= */
function setupHorizontalSections(callback) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      horizontalSections.forEach((section) => {
        if (!section.classList.contains("active")) return;

        const track = section.querySelector(".museum_h_track");
        if (!track) return;

        resetHorizontalSection(section);

        const totalScrollX = Math.max(track.scrollWidth - window.innerWidth, 0);
        const startHold = 600;
        const extraScroll = window.innerWidth <= 1440 ? 80 : 1600; // 1440 이하면 800

        section.style.height = `${
          window.innerHeight + totalScrollX + startHold + extraScroll
        }px`;
      });

      if (typeof callback === "function") callback();
    });
  });
}

  /* =========================================================
   * 10. 큐브 → 전시 섹션 전환
   * - intro를 서서히 사라지게 하고
   * - 선택된 전시 섹션만 활성화
   * - 전환 직후 가로스크롤 시작
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

              if (!horizontalRafId) {
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

  cubeFaces.forEach((item) => {
    item.classList.remove("is_active", "is_hidden");
  });

  face.classList.add("is_active");

  cubeFaces.forEach((item) => {
    if (item !== face) item.classList.add("is_hidden");
  });

// 1440px 이하 : 페이드 아웃 후 전시로
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

  // 1440px 초과 : 기존 큐브 확대 애니메이션
  const rotateY = getFaceRotation(targetId);

  const tl = gsap.timeline();

  tl.to(cube, {
    rotateY,
    duration: 0.9,
    ease: "power2.inOut",
  })
    .to(cubeStage, {
      scale: Math.max(window.innerWidth / 1000, window.innerHeight / 560) * 1.1,
      y: -20,
      duration: 1.5,
      ease: "power3.out",
    }, "-=0.1")
    .to(introScene, {
      opacity: 0.35,
      duration: 0.7,
      ease: "power2.out",
    }, "-=0.75")
    .call(() => {
      switchToMuseum(targetSection);
    });
}

  /* =========================================================
   * 12. 자동 진입
   * - 큐브 스크롤 구간 마지막에서 자동으로 서울 면 확대
   * ========================================================= */
  function triggerAutoExpand() {
    if (isTransitioning || hasTriggeredExpand) return;

    // [BUG FIX] 플래그를 먼저 세팅해야 seoulFace 없을 때 무한 반복 호출 방지
    hasTriggeredExpand = true;
    isTransitioning = true;

    const seoulFace = document.querySelector('[data-target="seoul"]');
    if (!seoulFace) {
      isTransitioning = false; // 복구
      return;
    }

    lenis.stop();
    expandSelectedFace(seoulFace);
  }

  /* =========================================================
   * 13. 큐브 스크롤 인터랙션
   * - 스크롤에 따라 큐브가 회전
   * - 마지막에는 서울 면이 정면에 오도록 정렬
   * - 스크롤 중엔 큐브 크기 고정
   * ========================================================= */
  function initCubeScrollTrigger() {
    if (cubeScrollTrigger) {
      cubeScrollTrigger.kill();
      cubeScrollTrigger = null;
    }

    cubeScrollTrigger = ScrollTrigger.create({
      trigger: introScene,
      start: "top top",
      end: "+=400%", // [BUG FIX] 300% → 400% (500vh 높이와 맞춤)
      scrub: 2,
      onUpdate(self) {
        if (isTransitioning) return;

        const p = self.progress;
        let rotation;

        // 초반엔 살짝 회전
        if (p < 0.8) {
          const spinProgress = p / 0.8;
          const easedSpin = 1 - Math.pow(1 - spinProgress, 3);
          rotation = easedSpin * 540; // 1.5바퀴
        } else {
          // 후반엔 서울 면이 정면으로 오도록 정렬
          const settleProgress = (p - 0.8) / 0.2;
          const currentRotation = 540;
          const targetRotation = 720;
          rotation =
            currentRotation + (targetRotation - currentRotation) * settleProgress;
        }

        gsap.set(cube, { rotateY: rotation });

        gsap.set(cubeStage, {
          scale: 1,
          opacity: 1,
        });

        if (p >= 0.95 && !hasTriggeredExpand) {
          triggerAutoExpand();
        }
      },
    });
  }

  /* =========================================================
   * 14. 전시 → 다시 큐브로 복귀
   * - 전시 활성화 해제
   * - 가로스크롤 상태 초기화
   * - 큐브 초기 상태로 복구
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

    cubeFaces.forEach((face) => {
      face.classList.remove("is_active", "is_hidden");
    });

    isTransitioning = false;
    hasTriggeredExpand = false;

    gsap.set(cube, { rotateY: 0 });
    gsap.set(cubeStage, {
      scale: 1,
      opacity: 1,
      clearProps: "transform,opacity",
    });

    introScene.style.display = "";
    introScene.classList.remove("is_leaving");
    // [BUG FIX] introScene opacity 완전 복구 (expandSelectedFace에서 0.35로 낮춘 것 되돌리기)
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
   * 16. 전시 섹션 스크롤 이벤트
   * - museum 상태일 때만 가로스크롤 애니메이션 실행
   * ========================================================= */
  window.addEventListener(
    "scroll",
    () => {
      if (!isMuseumReady) return;

      if (!horizontalRafId) {
        horizontalRafId = requestAnimationFrame(animateHorizontal);
      }

      updateCompactHeader();
    },
    { passive: true }
  );

  /* =========================================================
   * 17. 리사이즈 대응
   * - 화면 크기 변경 시 가로스크롤 거리 재계산
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

      if (isMuseumReady && !horizontalRafId) {
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
   * - 클릭한 면 기준으로 바로 확대 전환
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
   * - 아래로 스크롤 시 헤더 위로 숨김
   * - 위로 스크롤 시 헤더 다시 표시
   * - 전시 전환(isTransitioning) 중엔 동작 안 함
   * ========================================================= */
  const header = document.querySelector(".header");

  if (header) {
    header.style.transition = "transform 0.35s ease";

    let lastScrollY = 0;

    lenis.on("scroll", ({ scroll }) => {
      if (isTransitioning) return;

      if (scroll > lastScrollY && scroll > 80) {
        // 아래로 스크롤 → 헤더 숨김
        header.style.transform = "translateY(-100%)";
      } else {
        // 위로 스크롤 → 헤더 표시
        header.style.transform = "translateY(0)";
      }

      lastScrollY = scroll;
    });
  }
/* =========================================================
 * 21. 큐브 커서 호버 효과
 * ========================================================= */
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

  // 도트 생성
  const dots = document.createElement('div');
  dots.className = 'slide_dots';
  faces.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('is_active');
    dot.addEventListener('click', () => goTo(i));
    dots.appendChild(dot);
  });
  cubePinEl.appendChild(dots);

  // 화살표 생성
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

  // 터치 스와이프
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

// 1024px 이하일 때만 실행
if (window.innerWidth <= 1024) {
  initMobileSlide();
}

});