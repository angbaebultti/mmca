document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const qs = (s) => document.querySelector(s);
  const qsa = (s) => document.querySelectorAll(s);

  const ticketWrap = qs('.ticket');
  const ticketLeft = qs('.ticket_left img');
  const ticketRight = qs('.ticket_right img');
  const mainTitle = qs('.main_title');

  const about = qs('.about');
  const aboutHero = qs('.about_hero');
  const aboutContent = qs('.about_content');
  const aboutScene = qs('.about_scene');

  const stats = qsa('.stat');
  const ticketBg = qs('.ticket_bg');

  /* =========================================================
   * 1. 배경 티켓 생성
   * ========================================================= */
  if (ticketBg) {
    for (let i = 0; i < 12; i++) {
      const img = document.createElement('img');
      img.src = 'img/ticket_full.png';
      img.classList.add('t');
      img.style.left = Math.random() * 100 + '%';
      img.style.top = -100 - Math.random() * 300 + 'px';
      img.style.width = 500 + Math.random() * 400 + 'px';
      img.style.transform = `rotate(${gsap.utils.random(-30, 30)}deg)`;
      img.style.opacity = 0;
      img.style.filter = `blur(${2 + Math.random() * 3}px)`;
      ticketBg.appendChild(img);
    }
  }

  const tickets = qsa('.t');

  /* =========================================================
   * 2. 초기 세팅
   * ========================================================= */
  gsap.set(ticketLeft, { rotation: 0, x: 0, y: 0, opacity: 1, transformOrigin: 'bottom center' });
  gsap.set(ticketRight, { rotation: 0, x: 0, y: 0, opacity: 1, transformOrigin: 'bottom center' });
  gsap.set(ticketWrap, { opacity: 0, x: 220, y: 120 });
  gsap.set(aboutContent, { opacity: 0, y: 60 });  // y: 120 → y: 60


  /* =========================================================
   * 3. 메인 비주얼 - 티켓 등장 + 찢어짐 + 고정 + 떨어짐
   * ========================================================= */
  const mainTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.main_visual',
      start: 'top top',
      end: '+=1800',
      scrub: 1.2,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
    }
  });


  mainTL
    .to(ticketWrap, { opacity: 1, x: 0, y: 0, ease: 'power2.out', duration: 0.4 }, 0)

    .to('.info_wrap', { opacity: 0, y: -20, ease: 'power1.out', duration: 0.3 }, 0.3)
    .to(mainTitle, { opacity: 0, y: -30, ease: 'power1.out', duration: 0.3 }, 0.3)

    .to(ticketLeft, { rotation: -25, x: -150, y: 100, ease: 'none', duration: 0.4 }, 0.35)
    .to(ticketRight, { rotation: 25, x: 150, y: 100, ease: 'none', duration: 0.4 }, 0.35)


    .to(ticketLeft, { y: 1800, x: -400, rotationZ: -55, ease: 'power2.in', duration: 1.4 }, 0.75)
    .to(ticketRight, { y: 1800, x: 400, rotationZ: 55, ease: 'power2.in', duration: 1.4 }, 0.75)
    .to(ticketLeft, { opacity: 0, duration: 0.3 }, 1.8)
    .to(ticketRight, { opacity: 0, duration: 0.3 }, 1.8)

  //about 타임라인
  const aboutTL = gsap.timeline({
    scrollTrigger: {
      trigger: about,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.4,
      pin: '.about_scene',
      pinSpacing: true,
      anticipatePin: 1,
    }
  });
  aboutTL.to(aboutHero, { opacity: 0, scale: 0.95, y: -20, ease: 'none', duration: 0.5 }, 0);
  tickets.forEach((t, i) => {
    gsap.set(t, { left: Math.random() * 80 + 10 + '%', top: '-20%', position: 'absolute' });
    aboutTL.to(t, {
      opacity: 0.15,
      y: () => window.innerHeight * (0.68 + Math.random() * 0.18),
      x: () => gsap.utils.random(-140, 140),
      rotation: () => gsap.utils.random(-32, 32),
      scale: () => gsap.utils.random(0.55, 0.9),
      ease: 'power1.out', duration: 0.5
    }, 0.5 + i * 0.06);
  });
  aboutTL.to(aboutContent, {
    opacity: 1,
    y: 0,
    ease: 'power4.out',   // power2.out → power4.out (더 화끈하게)
    duration: 1.0          // 0.8 → 1.0 (여운 있게)
  }, 0.2);  // 0.3 → 0.2 (더 일찍 시작)

  /* =========================================================
 * 7. ABOUT 통계 등장 + 숫자 카운팅
 * ========================================================= */
  if (aboutContent && stats.length) {
    const statArray = Array.from(stats);
    const lineLeft = document.querySelector('.line_left');
    const lineRight = document.querySelector('.line_right');
    const statsBg = document.querySelector('.stats_bg');

    const statData = statArray.map(stat => {
      const strong = stat.querySelector('strong');
      const raw = strong ? strong.textContent.trim() : '0';
      const match = raw.replace(/,/g, '').match(/^(\d+)(.*)$/);
      return { el: strong, target: match ? parseInt(match[1]) : 0, suffix: match ? match[2] : '', original: raw };
    });

    statData.forEach(d => { if (d.el) d.el.textContent = '0' + d.suffix; });
    gsap.set(statArray, { opacity: 0, x: -60 });
    if (statsBg) gsap.set(statsBg, { opacity: 0 });
    if (lineLeft) lineLeft.style.setProperty('--line-scale', 0);
    if (lineRight) lineRight.style.setProperty('--line-scale', 0);

    function runStatAnimation() {
      statData.forEach(d => { if (d.el) d.el.textContent = '0' + d.suffix; });
      gsap.set(statArray, { opacity: 0, x: -60 });
      if (statsBg) gsap.set(statsBg, { opacity: 0 });
      if (lineLeft) lineLeft.style.setProperty('--line-scale', 0);
      if (lineRight) lineRight.style.setProperty('--line-scale', 0);

      const statTL = gsap.timeline();

      if (statsBg) statTL.to(statsBg, { opacity: 0.25, ease: 'power2.out', duration: 0.8 }, 0);

      statTL.to({}, {
        duration: 0.6,
        onUpdate() { if (lineLeft) lineLeft.style.setProperty('--line-scale', this.progress()); }
      }, 0);

      statData.forEach((d, i) => {
        const counter = { val: 0 };
        statTL.to(statArray[i], { opacity: 1, x: 0, ease: 'power3.out', duration: 0.6 }, 0.4 + i * 0.18);
        statTL.to(counter, {
          val: d.target, ease: 'power2.out', duration: 1.2,
          onUpdate() { if (d.el) d.el.textContent = Math.round(counter.val).toLocaleString('en-US') + d.suffix; },
          onComplete() { if (d.el) d.el.textContent = d.original; }
        }, 0.4 + i * 0.18);
      });

      statTL.to({}, {
        duration: 0.6,
        onUpdate() { if (lineRight) lineRight.style.setProperty('--line-scale', this.progress()); }
      }, 1.4);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runStatAnimation();
        }
      });
    }, { threshold: 0.4 });

    observer.observe(aboutContent);
  }


  /* =========================================================
   * 10. ARTIST PRIZE - 메인 가로 스크롤
   * view_btn_card는 애니메이션 제외
   * ========================================================= */
  const artistCards = gsap.utils.toArray('.artist_card:not(.view_btn_card)');
  const lines = gsap.utils.toArray('.artist_prize .line');
  const letters = gsap.utils.toArray('.title_main span');

  gsap.set(artistCards, { opacity: 0, xPercent: 30 });

  function getScrollAmount() {
    const track = document.querySelector('.artist_track');
    if (!track) return 0;
    return -(track.scrollWidth - window.innerWidth);
  }

  const masterTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.artist_prize', start: 'top top', end: '+=5500',
      scrub: 1.2, pin: true, anticipatePin: 1
    }
  });

  lines.forEach((line, i) => {
    masterTL.to(line.querySelectorAll('span'), {
      color: '#fff', stagger: 0.05, ease: 'none', duration: 0.3
    }, i * 0.15);
  });
  masterTL.to({}, { duration: 0.3 });
  masterTL.to(letters, {
    x: () => gsap.utils.random(-200, 200),
    y: () => gsap.utils.random(-200, 200),
    rotation: () => gsap.utils.random(-60, 60),
    opacity: 0, filter: 'blur(8px)',
    stagger: { each: 0.02, from: 'random' }, ease: 'power2.out', duration: 0.4
  });
  masterTL.to(artistCards, { opacity: 1, xPercent: 0, stagger: 0.06, ease: 'power3.out', duration: 0.4 });
  masterTL.to('.artist_track', { x: getScrollAmount, ease: 'none', duration: 1 });
  masterTL.to({}, { duration: 0.4 });  // ← 이 줄 추가! view 버튼에서 잠깐 머무르기

  /* =========================================================
 * 11. NEWS - 고급 탭 전환 + 커서 프리뷰
 * ========================================================= */
  const groups = Array.from(document.querySelectorAll('.news_group'));

  // 커서 프리뷰 엘리먼트 생성
  const newsPreview = document.createElement('div');
  newsPreview.id = 'newsPreview';
  newsPreview.innerHTML = '<img id="previewImg" src="" alt="" />';
  document.body.appendChild(newsPreview);
  const previewImg = document.getElementById('previewImg');

  let previewX = 0, previewY = 0;
  let previewRX = 0, previewRY = 0;

  (function lerpPreview() {
    previewRX += (previewX - previewRX) * 0.1;
    previewRY += (previewY - previewRY) * 0.1;
    if (newsPreview) {
      newsPreview.style.left = previewRX + 'px';
      newsPreview.style.top = previewRY + 'px';
    }
    requestAnimationFrame(lerpPreview);
  })();

  document.addEventListener('mousemove', (e) => {
    previewX = e.clientX;
    previewY = e.clientY;
  });

  if (groups.length) {
    groups[0].classList.add('is-open');

    groups.forEach((group) => {
      const head = group.querySelector('.news_head');
      const body = group.querySelector('.news_body');
      if (!head || !body) return;

      // 탭 클릭
      group.addEventListener('click', () => {
        if (group.classList.contains('is-open')) {
          const currentCards = group.querySelectorAll('.news_card');
          gsap.to(currentCards, {
            opacity: 0, y: -16,
            stagger: 0.04, duration: 0.2, ease: 'power2.in',
            onComplete: () => {
              group.classList.remove('is-open');
              gsap.set(currentCards, { opacity: 0, y: 24 });
              group.style.cursor = 'pointer';
            }
          });
          return;
        }


        const groupTop = group.getBoundingClientRect().top + window.scrollY;

        const current = groups.find(g => g.classList.contains('is-open'));
        if (current) {
          const currentCards = current.querySelectorAll('.news_card');
          gsap.to(currentCards, {
            opacity: 0, y: -16,
            stagger: 0.04, duration: 0.2, ease: 'power2.in',
            onComplete: () => {
              current.classList.remove('is-open');
              gsap.set(currentCards, { opacity: 0, y: 24 });

              group.classList.add('is-open');
              const newCards = group.querySelectorAll('.news_card');
              gsap.set(newCards, { opacity: 0, y: 24 });
              gsap.to(newCards, {
                opacity: 1, y: 0,
                stagger: 0.08, duration: 0.5, ease: 'power3.out',
                delay: 0.05
              });
            }
          });
        } else {
          group.classList.add('is-open');
          const newCards = group.querySelectorAll('.news_card');
          gsap.set(newCards, { opacity: 0, y: 24 });
          gsap.to(newCards, {
            opacity: 1, y: 0,
            stagger: 0.08, duration: 0.5, ease: 'power3.out'
          });
        }
      });

      // 카드 hover 시 커서 프리뷰
      const cards = group.querySelectorAll('.news_card');
      cards.forEach(card => {
        const img = card.querySelector('.news_thumb img');
        if (!img) return;
        card.addEventListener('mouseenter', () => {
          previewImg.src = img.src;
          newsPreview.classList.add('is-visible');
        });
        card.addEventListener('mouseleave', () => {
          newsPreview.classList.remove('is-visible');
        });
      });
    });

    // 초기 열린 탭 카드 애니메이션
    const initCards = groups[0].querySelectorAll('.news_card');
    gsap.set(initCards, { opacity: 0, y: 24 });
    gsap.to(initCards, {
      opacity: 1, y: 0,
      stagger: 0.08, duration: 0.6, ease: 'power3.out',
      delay: 0.3
    });
  }
  /* =========================================================
   * 12. SHOP
   * ========================================================= */
  const positions = [
    { x: -580, y: -280, r: -15 }, { x: 120, y: -320, r: 10 }, { x: 560, y: -200, r: 20 },
    { x: -620, y: 20, r: 8 }, { x: 600, y: 60, r: -12 }, { x: -480, y: 280, r: -20 },
    { x: -80, y: 340, r: 5 }, { x: 380, y: 300, r: 18 }, { x: 620, y: 260, r: -10 }
  ];

  gsap.set('.p', { x: 0, y: 0, scale: 0.5, opacity: 0, rotation: (i) => positions[i].r * 0.3 });

  const shopTL = gsap.timeline({
    scrollTrigger: { trigger: '.shop', start: 'top top', end: 'bottom top', scrub: 1.2 }
  });

  shopTL.to('.p', { opacity: 0.7, scale: 0.6, duration: 0.25, ease: 'power1.out' }, 0);
  document.querySelectorAll('.p').forEach((el, i) => {
    shopTL.to(el, {
      opacity: 1, scale: 1, x: positions[i].x, y: positions[i].y,
      rotation: positions[i].r, ease: 'expo.out', duration: 0.7
    }, 0.25);
  });
  shopTL.to('.glass_front', {
    background: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 0 40px 20px rgba(255,255,255,0.4), 0 0 100px 40px rgba(255,255,255,0.2)',
    backdropFilter: 'blur(0px)', duration: 0.4
  }, 0.25);
  shopTL.to('.glass_front h2', { color: '#000', duration: 0.3 }, 0.3);
  shopTL.to('.glass_front p', { color: '#555', duration: 0.3 }, 0.3);
  shopTL.to('.glow_bg', { opacity: 0.7, scale: 1.8, filter: 'blur(80px)', duration: 0.5 }, 0.25);
  shopTL.to('.glass_box', { scale: 1.04, z: 80, duration: 0.8, ease: 'power3.out' }, 0.25);

  /* =========================================================
   * 13. 커서 UI
   * ========================================================= */
  document.body.insertAdjacentHTML('beforeend', `
    <div class="cursor-ring" id="cursorRing">ENTER ↗</div>
    <div class="cursor-dot" id="cursorDot"></div>
  `);

  const ring = document.getElementById('cursorRing');
  const dot = document.getElementById('cursorDot');
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

  const shopSection = document.querySelector('.shop');
  const glassBox = document.querySelector('.glass_box');

  if (glassBox && ring && dot) {
    glassBox.addEventListener('mouseenter', () => {
      ring.classList.add('shop-hover');
      dot.style.opacity = '0';
    });
    glassBox.addEventListener('mouseleave', () => {
      ring.classList.remove('shop-hover');
      dot.style.opacity = '1';
    });
  }

  if (glassBox) {
    glassBox.addEventListener('mousemove', (e) => {
      const rect = glassBox.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(glassBox, { x: x * 0.08, y: y * 0.08, duration: 0.5, ease: 'power2.out' });
    });
    glassBox.addEventListener('mouseleave', () => {
      gsap.to(glassBox, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    });
  }

  /* =========================================================
   * 14. 리사이즈 갱신
   * ========================================================= */
  window.addEventListener('resize', () => ScrollTrigger.refresh());
});