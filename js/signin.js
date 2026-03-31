
  if (window.innerWidth > 480) {

    // 중복 생성 방지
    if (!document.querySelector(".cursor-dot")) {

      document.body.insertAdjacentHTML(
        "beforeend",
        `<div class="cursor-ring" id="cursorRing"></div>
         <div class="cursor-dot" id="cursorDot"></div>`
      );

      const ring = document.getElementById("cursorRing");
      const dot  = document.getElementById("cursorDot");

      let mx = 0, my = 0;
      let rx = window.innerWidth / 2;
      let ry = window.innerHeight / 2;

      // dot (빠르게)
      document.addEventListener("mousemove", (e) => {
        mx = e.clientX;
        my = e.clientY;

        dot.style.left = mx + "px";
        dot.style.top  = my + "px";
      });

      // ring (부드럽게)
      function animateCursor() {
        rx += (mx - rx) * 0.1;
        ry += (my - ry) * 0.1;

        ring.style.left = rx + "px";
        ring.style.top  = ry + "px";

        requestAnimationFrame(animateCursor);
      }
      animateCursor();

      // 클릭 효과
      document.addEventListener("mousedown", () => {
        ring.style.transform = "translate(-50%, -50%) scale(0.8)";
      });

      document.addEventListener("mouseup", () => {
        ring.style.transform = "translate(-50%, -50%) scale(1)";
      });

    }
  }