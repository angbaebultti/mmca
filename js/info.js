document.addEventListener("DOMContentLoaded", () => {

  // ── plan 섹션 - Address 초기 열림
  const address_btn = document.querySelector('.address .plus');
  const address_container = document.querySelector('#address_container');
  if (address_btn && address_container) {
    address_btn.setAttribute('aria-expanded', 'true');
    address_container.setAttribute('aria-hidden', 'false');
  }

  // ── plan 섹션 아코디언
  const tit_list = document.querySelectorAll('.plan .inner .tit');

  tit_list.forEach(function (tit) {
    tit.addEventListener('click', function () {
      const item = tit.parentElement;
      const button = item.querySelector('.plus');
      const container = item.querySelector('.container');
      const is_open = button.getAttribute('aria-expanded') === 'true';

      tit_list.forEach(function (other_tit) {
        const other_item = other_tit.parentElement;
        const other_button = other_item.querySelector('.plus');
        const other_container = other_item.querySelector('.container');
        other_button.setAttribute('aria-expanded', 'false');
        other_container.setAttribute('aria-hidden', 'true');
      });

      if (!is_open) {
        button.setAttribute('aria-expanded', 'true');
        container.setAttribute('aria-hidden', 'false');
      }
    });
  });


  // ── getting 섹션 탭
  const tab_btns = document.querySelectorAll('.getting .btn_box button');
  const panels = document.querySelectorAll('.getting .info_box > div');

  document.querySelector('#subway_panel').classList.add('is_active');

  tab_btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tab_btns.forEach(b => b.classList.remove('is_active'));
      btn.classList.add('is_active');

      const target = btn.dataset.target;
      panels.forEach(function (panel) {
        panel.classList.remove('is_active');
        if (panel.id === target) panel.classList.add('is_active');
      });

      if (target === 'shuttle_panel') {
        setTimeout(function () {
          const shuttle = document.querySelector('#shuttle_panel');
          if (shuttle) shuttle.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    });
  });


  // ── museum map 탭 (PC)
  (function () {
    const tabs    = document.querySelectorAll('.map_inner .floor_tab');
    const fp      = document.querySelectorAll('.map_inner .floor_panel');
    const legends = document.querySelectorAll('.legend_panel');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const target = this.dataset.floor;

        tabs.forEach(function (t) {
          t.classList.remove('is_active');
          t.setAttribute('aria-selected', 'false');
        });
        this.classList.add('is_active');
        this.setAttribute('aria-selected', 'true');

        fp.forEach(function (p) { p.classList.remove('is_active'); });
        var activePanel = document.getElementById('floor_' + target);
        if (activePanel) {
          activePanel.classList.add('is_active');
          var img = activePanel.querySelector('img');
          if (img) {
            img.style.animation = 'none';
            img.offsetHeight;
            img.style.animation = '';
          }
        }

        legends.forEach(function (l) { l.classList.remove('is_active'); });
        var activeLegend = document.querySelector('.legend_panel[data-legend="' + target + '"]');
        if (activeLegend) activeLegend.classList.add('is_active');
      });
    });
  })();


  // ── map modal (태블릿) — 층 항목 클릭 시 해당 층 도면 모달 열기
  const map_modal    = document.getElementById('map_modal');
  const map_modal_close = document.getElementById('map_modal_close');
  const modal_panels = document.querySelectorAll('.map_modal .floor_panel');
  const floor_items  = document.querySelectorAll('.map_floor_item');

  floor_items.forEach(function (item) {
    item.addEventListener('click', function () {
      const floor = this.dataset.floor;

      // 모달 내 패널 초기화 후 해당 층 활성화
      modal_panels.forEach(p => p.classList.remove('is_active'));

      const target_panel = document.getElementById('modal_floor_' + floor);
      if (target_panel) target_panel.classList.add('is_active');

      map_modal.classList.add('is_open');
      map_modal.setAttribute('aria-hidden', 'false');
    });
  });

  if (map_modal_close) {
    map_modal_close.addEventListener('click', () => {
      map_modal.classList.remove('is_open');
      map_modal.setAttribute('aria-hidden', 'true');
    });
  }

  if (map_modal) {
    map_modal.addEventListener('click', (e) => {
      if (e.target === map_modal) {
        map_modal.classList.remove('is_open');
        map_modal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // ── wave canvas
  (function initWave() {
    const canvas = document.getElementById("waveCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height;
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
      requestAnimationFrame(draw);
    }

    const convenientSection    = document.querySelector(".convenient");
    const heading              = document.querySelector(".convenient .heading");
    const accessibilitySection = document.querySelector(".accessibility");

    window.addEventListener("scroll", () => {
      if (!convenientSection || !heading) return;
      const headingBottom = heading.getBoundingClientRect().bottom;
      const accTop = accessibilitySection?.getBoundingClientRect().top ?? Infinity;
      canvas.style.opacity = (headingBottom < 0 && accTop > 500) ? "1" : "0";
    });

    resize();
    draw();
    window.addEventListener("resize", resize);
  })();


  // ── 커스텀 커서
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


  // ── convenient 카드 flip 애니메이션
  (function () {
    const cards = document.querySelectorAll('.convenient .con_card');
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const card = entry.target;
          const idx = Array.from(cards).indexOf(card);
          setTimeout(function () {
            card.classList.add('flip_animate');
          }, idx * 120);
          observer.unobserve(card);
        }
      });
    }, { threshold: 0.2 });

    cards.forEach(function (card) { observer.observe(card); });
  })();

      // data-cursor="light" → 커서 주황색
    document.querySelectorAll('[data-cursor="light"]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.classList.add('orange');
        dot.classList.add('orange');
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('orange');
        dot.classList.remove('orange');
      });
    });

}); // end