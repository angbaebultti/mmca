document.addEventListener("DOMContentLoaded", () => {
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

  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  let isTransitioning = false;
  let hasTriggeredExpand = false;
  let isMuseumReady = false;
  let horizontalRafId = null;
  let cubeScrollTrigger = null;

  const currentX = new WeakMap();

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

  // 큐브 면별 정면 회전값
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

  // 가로 스크롤 이동값 계산
  function getTargetX(section) {
    const track = section.querySelector(".museum_h_track");
    if (!track) return 0;

    const sectionTop = getAbsoluteTop(section);
    const rawProgress = Math.max(window.scrollY - sectionTop, 0);

    const maxTranslate = Math.max(track.scrollWidth - window.innerWidth, 0);
    const cardWidth = window.innerWidth;

    // 두 번째 카드쯤에서 살짝 머무는 느낌
    const secondSlideEnd = cardWidth * 2;
    const holdLength = 1500;

    let targetX;

    if (rawProgress <= secondSlideEnd) {
      targetX = rawProgress;
    } else if (rawProgress <= secondSlideEnd + holdLength) {
      targetX = secondSlideEnd;
    } else {
      targetX = rawProgress - holdLength;
    }

    return Math.max(0, Math.min(targetX, maxTranslate));
  }

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

  function setupHorizontalSections(callback) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        horizontalSections.forEach((section) => {
          if (!section.classList.contains("active")) return;

          const track = section.querySelector(".museum_h_track");
          if (!track) return;

          resetHorizontalSection(section);

          const totalScrollX = Math.max(track.scrollWidth - window.innerWidth, 0);
          const holdLength = 1800;

          section.style.height = `${window.innerHeight + totalScrollX + holdLength}px`;
        });

        if (typeof callback === "function") callback();
      });
    });
  }

  // 전시 섹션으로 전환
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

  // 선택한 큐브 면 확대
  function expandSelectedFace(face) {
    const targetId = face.dataset.target;
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    const rotateY = getFaceRotation(targetId);

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

    gsap.to(cube, {
      rotateY,
      duration: 0.7,
      ease: "power2.inOut",
      onComplete() {
        gsap.to(cubeStage, {
          scale: 2,
          duration: 1.3,
          ease: "power2.out",
          onComplete() {
            switchToMuseum(targetSection);
          },
        });
      },
    });
  }

  // 자동 전환: 서울 면으로 진입
  function triggerAutoExpand() {
    if (isTransitioning || hasTriggeredExpand) return;

    hasTriggeredExpand = true;
    isTransitioning = true;

    lenis.stop();

    const seoulFace = document.querySelector('[data-target="seoul"]');
    if (!seoulFace) return;

    expandSelectedFace(seoulFace);
  }

  // 큐브 스크롤 트리거
  function initCubeScrollTrigger() {
    if (cubeScrollTrigger) {
      cubeScrollTrigger.kill();
      cubeScrollTrigger = null;
    }

    cubeScrollTrigger = ScrollTrigger.create({
      trigger: introScene,
      start: "top top",
      end: "+=300%",
      scrub: 2,
      onUpdate(self) {
        if (isTransitioning) return;

        const p = self.progress;
        let rotation;

        // 초반엔 살짝만 돌고
        if (p < 0.8) {
          const spinProgress = p / 0.8;
          const easedSpin = 1 - Math.pow(1 - spinProgress, 3);
          rotation = easedSpin * 540; // 1.5바퀴
        } else {
          // 마지막에 서울이 정면으로 오도록 정렬
          const settleProgress = (p - 0.8) / 0.2;
          const currentRotation = 540;
          const targetRotation = 720; // 정면
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

  // 다시 큐브로 복귀
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
    introScene.style.opacity = "";
    introScene.classList.remove("is_leaving");

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

  if (topBtn) {
    topBtn.addEventListener("click", (e) => {
      e.preventDefault();
      returnToCube();
    });
  }

  // 큐브 면 클릭 시 해당 전시로 이동
  cubeFaces.forEach((face) => {
    face.addEventListener("click", () => {
      if (isTransitioning) return;

      isTransitioning = true;
      hasTriggeredExpand = true;
      lenis.stop();
      expandSelectedFace(face);
    });
  });
});