document.addEventListener("DOMContentLoaded", () => {
  const cube = document.getElementById("cube");
  const cubeHitArea = document.getElementById("cubeHitArea");
  const introScene = document.querySelector(".intro_scene");
  const nextSection = document.getElementById("nextSection");

  const introFullscreen = document.getElementById("introFullscreen");
  const introFullscreenImg = document.getElementById("introFullscreenImg");
  const introFullscreenTitle = document.getElementById("introFullscreenTitle");

  let currentAngle = -30;
  let isDragging = false;
  let isTransitioning = false;
  let startX = 0;
  let startAngle = 0;
  let movedDistance = 0;

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

  cubeHitArea.addEventListener("pointermove", (event) => {
    if (!isDragging || isTransitioning) return;

    const deltaX = event.clientX - startX;
    movedDistance = Math.abs(deltaX);

    currentAngle = startAngle + deltaX * 0.25;
    cube.style.transform = `rotateY(${currentAngle}deg)`;
  });

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

  function snapToNearest() {
    const snappedAngle = Math.round(currentAngle / 90) * 90;
    currentAngle = snappedAngle;

    cube.style.transition = "transform 0.6s ease";
    cube.style.transform = `rotateY(${currentAngle}deg)`;
  }

  function handleFaceSelect(clientX, clientY) {
    cubeHitArea.style.pointerEvents = "none";

    const clickedElement = document.elementFromPoint(clientX, clientY);
    const clickedFace = clickedElement ? clickedElement.closest(".cube_face") : null;

    cubeHitArea.style.pointerEvents = "auto";

    if (!clickedFace) return;

    expandFace(clickedFace);
  }

  function expandFace(face) {
    const targetAngle = Number(face.getAttribute("data_angle"));
    const faceImg = face.querySelector("img");
    const faceTitle = face.querySelector(".face_title");

    isTransitioning = true;

    cube.style.transition = "transform 0.7s ease";
    cube.style.transform = `rotateY(${targetAngle}deg)`;
    currentAngle = targetAngle;

    setTimeout(() => {
      introFullscreenImg.src = faceImg.src;
      introFullscreenImg.alt = faceImg.alt;
      introFullscreenTitle.textContent = faceTitle.textContent;

      introScene.classList.add("is_transitioning");
      introFullscreen.classList.add("is_visible");

      setTimeout(() => {
        if (nextSection) {
          nextSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 800);
    }, 700);
  }
});