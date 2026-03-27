document.addEventListener("DOMContentLoaded", () => {

  // plan 섹션
  const tit_list = document.querySelectorAll('.plan .inner .tit');

  tit_list.forEach(function (tit) {
    tit.addEventListener('click', function () {
      const item = tit.parentElement;
      const button = item.querySelector('.plus');
      const container = item.querySelector('.container');
      const is_open = button.getAttribute('aria-expanded') === 'true';

      // 다른 아코디언 전부 닫기
      tit_list.forEach(function (other_tit) {
        const other_item = other_tit.parentElement;
        const other_button = other_item.querySelector('.plus');
        const other_container = other_item.querySelector('.container');

        other_button.setAttribute('aria-expanded', 'false');
        other_container.setAttribute('aria-hidden', 'true');
      });

      // 클릭한 항목 토글
      if (!is_open) {
        button.setAttribute('aria-expanded', 'true');
        container.setAttribute('aria-hidden', 'false');
      }
    });
  });


  // getting 섹션
  const tab_btns = document.querySelectorAll('.getting .btn_box button');
  const panels = document.querySelectorAll('.getting .info_box > div');

  // 초기 활성화
  document.querySelector('#subway_panel').classList.add('is_active');

  tab_btns.forEach(function (btn) {
    btn.addEventListener('click', function () {

      // 버튼 is_active 토글
      tab_btns.forEach(b => b.classList.remove('is_active'));
      btn.classList.add('is_active');

      // 패널 is_active 토글
      const target = btn.dataset.target;
      panels.forEach(function (panel) {
        panel.classList.remove('is_active');
        if (panel.id === target) {
          panel.classList.add('is_active');
        }
      });

    });
  });


/* museum map */

(function () {
  const tabs      = document.querySelectorAll('.floor_tab');
  const panels    = document.querySelectorAll('.floor_panel');
  const legends   = document.querySelectorAll('.legend_panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = this.dataset.floor;   // 'b1' | '1f' | '2f' | '3f'

      // 탭 상태 갱신
      tabs.forEach(function (t) {
        t.classList.remove('is_active');
        t.setAttribute('aria-selected', 'false');
      });
      this.classList.add('is_active');
      this.setAttribute('aria-selected', 'true');

      // 도면 패널 전환
      panels.forEach(function (p) {
        p.classList.remove('is_active');
      });
      var activePanel = document.getElementById('floor_' + target);
      if (activePanel) {
        activePanel.classList.add('is_active');
        // 이미지 재애니메이션: src 유지하면서 fade 효과 재실행
        var img = activePanel.querySelector('img');
        if (img) {
          img.style.animation = 'none';
          img.offsetHeight; // reflow 강제
          img.style.animation = '';
        }
      }

      // 공간 리스트 전환
      legends.forEach(function (l) {
        l.classList.remove('is_active');
      });
      var activeLegend = document.querySelector('.legend_panel[data-legend="' + target + '"]');
      if (activeLegend) {
        activeLegend.classList.add('is_active');
      }
    });
  });
})();

(function initWave() {
  const canvas = document.getElementById("waveCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height, animId;
  let offset = 0;

  function resize() {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.5;

    const amplitude = 40;
    const frequency = 0.004;
    const speed = 0.005;

    for (let x = 0; x <= width; x++) {
      const y = height / 2 + Math.sin(x * frequency + offset) * amplitude;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
    offset += speed;
    animId = requestAnimationFrame(draw);
  }

  // 스크롤 감지해서 타이틀 지나면 fade in
  const convenientSection = document.querySelector(".convenient");
  const heading = document.querySelector(".convenient .heading");
  const accessibilitySection = document.querySelector(".accessibility");

  window.addEventListener("scroll", () => {
    if (!convenientSection || !heading) return;

    const headingBottom = heading.getBoundingClientRect().bottom;
    const accTop = accessibilitySection?.getBoundingClientRect().top ?? Infinity;

    if (headingBottom < 0 && accTop > 500) {
      canvas.style.opacity = "1";
    } else {
      canvas.style.opacity = "0";
    }
  });

  resize();
  draw();
  window.addEventListener("resize", () => {
    resize();
  });
})();

/* 마우스 */
document.body.insertAdjacentHTML('beforeend', `
    <div class="cursor-ring" id="cursorRing">ENTER ↗</div>
    <div class="cursor-dot" id="cursorDot"></div>
  `);

  const ring = document.getElementById('cursorRing');
  const dot  = document.getElementById('cursorDot');
  let mx = 0, my = 0, rx = window.innerWidth / 2, ry = window.innerHeight / 2;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
  });

  (function lerpRing() {
    rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(lerpRing);
  })();

}); //end