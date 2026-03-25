document.addEventListener("DOMContentLoaded", () => {
  const cube = document.getElementById("cube");
  const cubeHitArea = document.getElementById("cubeHitArea");
  const introScene = document.querySelector(".intro_scene");

  const introFullscreen = document.getElementById("introFullscreen");
  const introFullscreenImg = document.getElementById("introFullscreenImg");
  const introFullscreenTitle = document.getElementById("introFullscreenTitle");

  const museumWrap = document.getElementById("museumWrap");
  const museumSections = document.querySelectorAll(".museum_exhibit_section");
  const horizontalSections = document.querySelectorAll(
    ".museum_exhibit_section.is_horizontal"
  );
  const topBtn = document.querySelector(".top_btn a");
  const topBtnWrap = document.querySelector(".top_btn");

  let currentAngle = -30;
  let isDragging = false;
  let isTransitioning = false;
  let startX = 0;
  let startAngle = 0;
  let movedDistance = 0;


    //드래그 시작

  cubeHitArea.addEventListener("pointerdown", (event) => {
    if (isTransitioning) return;

    event.preventDefault();
    isDragging = true;
    startX = event.clientX;
    startAngle = currentAngle;
    movedDistance = 0;

    cube.style.transition = "none";
    cubeHitArea.setPointerCapture(event.pointerId);
  });


     //드래그 중

  cubeHitArea.addEventListener("pointermove", (event) => {
    if (!isDragging || isTransitioning) return;

    const deltaX = event.clientX - startX;
    movedDistance = Math.abs(deltaX);

    currentAngle = startAngle + deltaX * 0.25;
    cube.style.transform = `rotateY(${currentAngle}deg)`;
  });


     //드래그 끝

  cubeHitArea.addEventListener("pointerup", (event) => {
    if (!isDragging || isTransitioning) return;

    isDragging = false;
    cubeHitArea.releasePointerCapture(event.pointerId);

    if (movedDistance <= 8) {
      handleFaceSelect(event.clientX, event.clientY);
    } else {
      snapToNearest();
    }
  });

  cubeHitArea.addEventListener("pointercancel", (event) => {
    if (!isDragging || isTransitioning) return;

    isDragging = false;
    cubeHitArea.releasePointerCapture(event.pointerId);
    snapToNearest();
  });


     //가장 가까운 면으로 스냅

  function snapToNearest() {
    const snappedAngle = Math.round(currentAngle / 90) * 90;
    currentAngle = snappedAngle;

    cube.style.transition = "transform 0.6s ease";
    cube.style.transform = `rotateY(${currentAngle}deg)`;
  }


     //클릭된 면 찾기
  function handleFaceSelect(clientX, clientY) {
    cubeHitArea.style.pointerEvents = "none";

    const clickedElement = document.elementFromPoint(clientX, clientY);
    const clickedFace = clickedElement
      ? clickedElement.closest(".cube_face")
      : null;

    cubeHitArea.style.pointerEvents = "auto";

    if (!clickedFace) return;
    expandFace(clickedFace);
  }


     //모든 전시관 섹션 숨기기
  function hideAllMuseumSections() {
    museumSections.forEach((section) => {
      section.classList.remove("active");
    });
  }


     //가로 섹션 높이 세팅
     //- 활성화된 섹션만 처리
     //- rAF 두 번으로 레이아웃 확정 후 scrollWidth 읽기
  function setupHorizontalSections(callback) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        horizontalSections.forEach((section) => {
          if (!section.classList.contains("active")) return;

          const track = section.querySelector(".museum_h_track");
          if (!track) return;

          const SCROLL_SPEED = 1.5;
          const cardCount = track.querySelectorAll(".museum_exhibit_card").length;
          // 카드가 2개 이상일 때만 마지막 카드 여유 스크롤 추가
          const EXTRA_SCROLL = cardCount >= 2 ? window.innerWidth * 0.6 : 0;

          const totalScrollX = Math.max(
            track.scrollWidth - window.innerWidth,
            0
          );
          const sectionHeight = window.innerHeight + totalScrollX * SCROLL_SPEED + EXTRA_SCROLL;
          section.style.height = `${sectionHeight}px`;
        });

        if (typeof callback === "function") callback();
      });
    });
  }


  //세로 스크롤 -> 가로 이동 (lerp 보간으로 부드럽게)

  function getSectionTop(section) {
    return section.getBoundingClientRect().top + window.scrollY;
  }

  // 각 섹션별 현재 렌더 위치 저장
  const currentX = new WeakMap();
  let rafId = null;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  const SCROLL_SPEED = 1.5; // setupHorizontalSections와 반드시 동일하게

  function getTargetX(section) {
    const track = section.querySelector(".museum_h_track");
    if (!track) return 0;

    const sectionTop = getSectionTop(section);
    const maxTranslate = Math.max(track.scrollWidth - window.innerWidth, 0);
    const progress = window.scrollY - sectionTop;
    // 세로 스크롤 진행도를 SCROLL_SPEED로 나눠서 실제 가로 이동량 계산
    return Math.max(0, Math.min(progress / SCROLL_SPEED, maxTranslate));
  }

  function animateHorizontal() {
    let stillMoving = false;

    horizontalSections.forEach((section) => {
      if (!section.classList.contains("active")) return;

      const track = section.querySelector(".museum_h_track");
      if (!track) return;

      const target = getTargetX(section);
      const current = currentX.has(section) ? currentX.get(section) : target;
      const next = lerp(current, target, 0.1); // 0.1 = 부드러움 강도 (낮을수록 더 부드럽게)

      currentX.set(section, next);
      track.style.transform = `translate3d(${-next}px, 0, 0)`;

      // 목표값과 충분히 가까워지면 멈춤
      if (Math.abs(next - target) > 0.5) stillMoving = true;
    });

    if (stillMoving) {
      rafId = requestAnimationFrame(animateHorizontal);
    } else {
      rafId = null;
    }
  }

  function handleHorizontalScroll() {
    if (!rafId) {
      rafId = requestAnimationFrame(animateHorizontal);
    }
  }

  function updateHorizontalSection(section) {
    // 초기 진입 시 즉시 위치 맞추기 (lerp 없이 순간 이동)
    if (!section || !section.classList.contains("active")) return;

    const track = section.querySelector(".museum_h_track");
    if (!track) return;

    const target = getTargetX(section);
    currentX.set(section, target);
    track.style.transform = `translate3d(${-target}px, 0, 0)`;
  }

  let expandTimer1 = null;
  let expandTimer2 = null;
  let expandTimer3 = null;
  let expandTimer4 = null;


     //큐브 선택 → 전시관 1개만 표시

  function expandFace(face) {
    const targetAngle = Number(face.dataset.angle);
    const targetId = face.dataset.target;

    const faceImg = face.querySelector("img");
    const faceTitle = face.querySelector(".face_title");
    const targetSection = document.getElementById(targetId);

    if (!targetSection) return;

    isTransitioning = true;

    /* 1. 큐브 회전 */
    cube.style.transition = "transform 0.55s ease";
    cube.style.transform = `rotateY(${targetAngle}deg)`;
    currentAngle = targetAngle;

    expandTimer1 = setTimeout(() => {
      /* 2. 전환막 표시 */
      introFullscreenImg.src = faceImg.src;
      introFullscreenImg.alt = faceImg.alt;
      introFullscreenTitle.textContent = faceTitle.textContent;
      introFullscreen.classList.add("is_visible");

      /* 3. 풀페이지 충분히 보여준 뒤 → 섹션 준비 → 페이드아웃 */
      expandTimer2 = setTimeout(() => {
        /* 인트로 숨기고, 전시 wrapper 열고, 전시관은 하나만 active */
        introScene.style.display = "none";
        museumWrap.classList.add("active");
        hideAllMuseumSections();
        targetSection.classList.add("active");
        if (topBtnWrap) topBtnWrap.classList.add("active");

        /* 레이아웃 확정 후 높이 계산 → 스크롤 이동 → 가로 초기화 */
        setupHorizontalSections(() => {
          targetSection.scrollIntoView({
            behavior: "auto",
            block: "start",
          });

          requestAnimationFrame(() => {
            updateHorizontalSection(targetSection);
          });
        });

        /* 전환막 자연스럽게 페이드아웃 */
        expandTimer3 = setTimeout(() => {
          introFullscreen.classList.remove("is_visible");
          expandTimer4 = setTimeout(() => {
            isTransitioning = false;
          }, 700);
        }, 80);

      }, 900);
    }, 420);
  }


    //스크롤 / 리사이즈

  window.addEventListener("scroll", handleHorizontalScroll, { passive: true });

  window.addEventListener("resize", () => {
    setupHorizontalSections(() => {
      handleHorizontalScroll();
    });
  });


    //큐브로 돌아가기 공통 함수

  function returnToCube() {
    // 진행 중인 타이머 전부 취소
    clearTimeout(expandTimer1);
    clearTimeout(expandTimer2);
    clearTimeout(expandTimer3);
    clearTimeout(expandTimer4);

    museumWrap.classList.remove("active");
    hideAllMuseumSections();
    introFullscreen.classList.remove("is_visible");
    introScene.style.display = "";
    if (topBtnWrap) topBtnWrap.classList.remove("active");

    // 상태 전부 리셋
    isTransitioning = false;
    isDragging = false;
    cubeHitArea.style.pointerEvents = "auto";

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    horizontalSections.forEach((section) => {
      const track = section.querySelector(".museum_h_track");
      if (track) track.style.transform = "translate3d(0, 0, 0)";
      section.style.height = "";
      currentX.delete(section);
    });

    introScene.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }


  //탑버튼 → 다시 큐브로

  if (topBtn) {
    topBtn.addEventListener("click", (event) => {
      event.preventDefault();
      returnToCube();
    });
  }

  // 초기 실행은 active 섹션 없으므로 호출 불필요
  // (큐브 클릭 시 setupHorizontalSections 호출됨)
});