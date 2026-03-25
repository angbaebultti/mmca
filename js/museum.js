document.addEventListener("DOMContentLoaded", () => {
  const cube = document.getElementById("cube");
  const cubeStage = document.querySelector(".cube_stage");
  const introScene = document.querySelector(".intro_scene");
  const cubeFaces = document.querySelectorAll(".cube_face");
  const overlay = document.getElementById("cubeExpandOverlay");

  const museumWrap = document.getElementById("museumWrap");
  const museumSections = document.querySelectorAll(".museum_exhibit_section");
  const horizontalSections = document.querySelectorAll(
    ".museum_exhibit_section.is_horizontal"
  );
  const topBtn = document.querySelector(".top_btn a");
  const topBtnWrap = document.querySelector(".top_btn");

  let currentAngle = 0;
  let targetAngle = 0;
  let introRafId = null;
  let horizontalRafId = null;
  let isTransitioning = false;

  const currentX = new WeakMap();

  const faceAngleMap = {
    seoul: 0,
    deoksugung: -90,
    gwacheon: -180,
    cheongju: -270,
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function getIntroProgress() {
    const rect = introScene.getBoundingClientRect();
    const maxScroll = introScene.offsetHeight - window.innerHeight;

    if (maxScroll <= 0) return 0;

    const scrolled = clamp(-rect.top, 0, maxScroll);
    return scrolled / maxScroll;
  }

  function animateIntro() {
    if (!isTransitioning && introScene.style.display !== "none") {
      const progress = getIntroProgress();

      targetAngle = progress * 1440;
      currentAngle = lerp(currentAngle, targetAngle, 0.08);

      cube.style.transform = `rotateY(${currentAngle}deg)`;

      let scale = 1;
      if (progress > 0.55) {
        const zoomProgress = clamp((progress - 0.55) / 0.45, 0, 1);
        scale = 1 + zoomProgress * 7.5;
      }

      const fadeProgress = clamp((progress - 0.82) / 0.18, 0, 1);

      cubeStage.style.transform = `scale(${scale})`;
      cubeStage.style.opacity = `${1 - fadeProgress}`;
    }

    introRafId = requestAnimationFrame(animateIntro);
  }

  function hideAllMuseumSections() {
    museumSections.forEach((section) => {
      section.classList.remove("active");
    });
  }

  function setupHorizontalSections(callback) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        horizontalSections.forEach((section) => {
          if (!section.classList.contains("active")) return;

          const track = section.querySelector(".museum_h_track");
          if (!track) return;

          const cardCount = track.querySelectorAll(".museum_exhibit_card").length;
          const totalScrollX = Math.max(track.scrollWidth - window.innerWidth, 0);
          const extraScroll = cardCount >= 2 ? window.innerWidth * 0.6 : 0;
          const scrollSpeed = 1.5;
          const sectionHeight =
            window.innerHeight + totalScrollX * scrollSpeed + extraScroll;

          section.style.height = `${sectionHeight}px`;
        });

        if (typeof callback === "function") callback();
      });
    });
  }

  function getSectionTop(section) {
    return section.getBoundingClientRect().top + window.scrollY;
  }

  function getTargetX(section) {
    const track = section.querySelector(".museum_h_track");
    if (!track) return 0;

    const scrollSpeed = 1.5;
    const sectionTop = getSectionTop(section);
    const maxTranslate = Math.max(track.scrollWidth - window.innerWidth, 0);
    const progress = window.scrollY - sectionTop;

    return Math.max(0, Math.min(progress / scrollSpeed, maxTranslate));
  }

  function animateHorizontal() {
    let stillMoving = false;

    horizontalSections.forEach((section) => {
      if (!section.classList.contains("active")) return;

      const track = section.querySelector(".museum_h_track");
      if (!track) return;

      const target = getTargetX(section);
      const current = currentX.has(section) ? currentX.get(section) : target;
      const next = lerp(current, target, 0.1);

      currentX.set(section, next);
      track.style.transform = `translate3d(${-next}px, 0, 0)`;

      if (Math.abs(next - target) > 0.5) stillMoving = true;
    });

    if (stillMoving) {
      horizontalRafId = requestAnimationFrame(animateHorizontal);
    } else {
      horizontalRafId = null;
    }
  }

  function handleHorizontalScroll() {
    if (!horizontalRafId) {
      horizontalRafId = requestAnimationFrame(animateHorizontal);
    }
  }

  function updateHorizontalSection(section) {
    if (!section || !section.classList.contains("active")) return;

    const track = section.querySelector(".museum_h_track");
    if (!track) return;

    const target = getTargetX(section);
    currentX.set(section, target);
    track.style.transform = `translate3d(${-target}px, 0, 0)`;
  }

  function expandSelectedFace(face) {
    const targetId = face.dataset.target;
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    const rect = face.getBoundingClientRect();
    const clone = face.cloneNode(true);

    clone.classList.add("cube_expand_box");
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.margin = "0";
    clone.style.transform = "none";
    clone.style.borderRadius = "0";

    overlay.innerHTML = "";
    overlay.appendChild(clone);
    overlay.style.opacity = "1";

    cubeStage.style.opacity = "0";

    requestAnimationFrame(() => {
      clone.style.transition =
        "left 1s ease, top 1s ease, width 1s ease, height 1s ease, border-radius 1s ease";
      clone.style.left = "0";
      clone.style.top = "0";
      clone.style.width = "100vw";
      clone.style.height = "100vh";
      clone.style.borderRadius = "0";
    });

    setTimeout(() => {
      introScene.style.display = "none";
      museumWrap.classList.add("active");
      hideAllMuseumSections();
      targetSection.classList.add("active");

      if (topBtnWrap) topBtnWrap.classList.add("active");

      setupHorizontalSections(() => {
        targetSection.scrollIntoView({
          behavior: "auto",
          block: "start",
        });

        requestAnimationFrame(() => {
          updateHorizontalSection(targetSection);
          overlay.style.opacity = "0";
          overlay.innerHTML = "";
          isTransitioning = false;
        });
      });
    }, 1050);
  }

  function selectFace(face) {
    if (isTransitioning) return;
    isTransitioning = true;

    const targetId = face.dataset.target;
    const faceAngle = faceAngleMap[targetId] ?? 0;

    currentAngle = faceAngle;
    targetAngle = faceAngle;

    cube.style.transition = "transform 0.75s ease";
    cubeStage.style.transition = "transform 0.75s ease, opacity 0.4s ease";
    cube.style.transform = `rotateY(${faceAngle}deg)`;
    cubeStage.style.transform = "scale(1.35)";

    setTimeout(() => {
      expandSelectedFace(face);
    }, 760);
  }

  function returnToCube() {
    museumWrap.classList.remove("active");
    hideAllMuseumSections();
    introScene.style.display = "";
    overlay.style.opacity = "0";
    overlay.innerHTML = "";

    if (topBtnWrap) topBtnWrap.classList.remove("active");

    isTransitioning = false;
    currentAngle = 0;
    targetAngle = 0;

    cube.style.transition = "none";
    cubeStage.style.transition = "none";
    cube.style.transform = "rotateY(0deg)";
    cubeStage.style.transform = "scale(1)";
    cubeStage.style.opacity = "1";

    horizontalSections.forEach((section) => {
      const track = section.querySelector(".museum_h_track");
      if (track) track.style.transform = "translate3d(0, 0, 0)";
      section.style.height = "";
      currentX.delete(section);
    });

    window.scrollTo({
      top: introScene.offsetTop,
      behavior: "smooth",
    });
  }

  cubeFaces.forEach((face) => {
    face.addEventListener("click", () => {
      selectFace(face);
    });
  });

  window.addEventListener("scroll", handleHorizontalScroll, { passive: true });

  window.addEventListener("resize", () => {
    setupHorizontalSections(() => {
      handleHorizontalScroll();
    });
  });

  if (topBtn) {
    topBtn.addEventListener("click", (event) => {
      event.preventDefault();
      returnToCube();
    });
  }

  animateIntro();
});