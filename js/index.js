document.addEventListener('DOMContentLoaded', () => {

  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ── Lenis 스무스 스크롤 ── */
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
  gsap.registerPlugin(ScrollTrigger);

  /* ── DOM 요소 ── */
  const drawPaths    = document.querySelectorAll('.draw-path');
  const waterRects   = ['wr-m1', 'wr-m2', 'wr-c', 'wr-a'].map(id => document.getElementById(id));
  const dropM2       = document.getElementById('drop-m2');
  const dropA        = document.getElementById('drop-a');
  const bgLayer      = document.querySelector('.bg_layer');
  const columnsLayer = document.getElementById('columns_layer');
  const textLayer    = document.getElementById('text_layer');
  const shapesLayer  = document.getElementById('shapes_layer');
  const borders      = document.querySelectorAll('.letter-cell:not(:last-child)');

  /* ── 유틸 함수 ── */
  function clamp01(v) { return Math.min(Math.max(v, 0), 1); }
  function range(p, s, e) { return clamp01((p - s) / (e - s)); }
  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  /* ── 스크롤 진행도 기반 애니메이션 ── */
  function onScroll() {
    const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

    // 선 그리기
    const s1 = easeOutExpo(range(p, 0, 2));
    drawPaths.forEach(path => { path.style.strokeDashoffset = 20000 * (1 - s1); });

    // 구분선 페이드인
    const sd = easeOutExpo(range(p, 0.05, 0.25));
    borders.forEach(b => { b.style.borderRightColor = `rgba(255,255,255,${sd})`; });

    // 물 채우기
    const s2 = easeOutExpo(range(p, 0.05, 0.60));
    const waterY = 1200 + (-200 - 1200) * s2;
    waterRects.forEach(r => { if (r) r.setAttribute('y', waterY); });

    // scroll hint 는 CSS mix-blend-mode 로 제어 — JS 에서 opacity 조작 안 함

    // A 크로스바 제거
    if (p >= 0.60) {
      const crossbar = document.querySelector('.a-crossbar');
      if (crossbar) crossbar.remove();
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ════════════════════════════════════════════════
     GSAP 타임라인

     위치 단위: vw / vh
     화면 크기가 바뀌어도 화면 대비 같은 비율 위치 유지
     리사이즈 시 buildTimeline() 재호출로 자동 재계산

     위치 수정은 INIT / FINAL 객체만 변경하면 됨
  ════════════════════════════════════════════════ */
  let tl = null;

  /* vw/vh → px 변환 헬퍼 */
  function vw(n) { return window.innerWidth  * n / 100; }
  function vh(n) { return window.innerHeight * n / 100; }

  function buildTimeline() {
    if (tl) {
      tl.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    }

    /* ── 초기 위치 — 여기서 수정 ── */
    const INIT = {
      mm: { x: vw(-32), y: vh(-20), scale: 1    },
      c:  { x: vw(2),   y: vh(-20), scale: 1.05 },
      a:  { x: vw(15),  y: vh(-20), scale: 1.03 },
    };

    /* ── 최종 위치 — 여기서 수정 ── */
    const FINAL = {
      mm: { x: vw(-18), y: vh(-35), scale: 1    },
      c:  { x: vw(-16), y: vh(-4),  scale: 1.05 },
      a:  { x: vw(0),   y: vh(-4),  scale: 1.03 },
    };

    /* 초기 위치 적용 */
    gsap.set('#part_mm', INIT.mm);
    gsap.set('#part_c',  INIT.c);
    gsap.set('#part_a',  INIT.a);

    tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroll_spacer',
        start: '10% top',
        end: 'bottom bottom',
        scrub: 1,
      }
    });

    /* Stage 1 — M2, A 낙하 */
    tl.to([dropM2, dropA], { y: '33vh', duration: 3, ease: 'power4.in' }, 0);

    /* Stage 2 — 배경·선 색 전환 */
    tl.to(bgLayer,   { opacity: 1, duration: 1,   ease: 'power2.inOut' });
    tl.to(drawPaths, { stroke: '#1a1a1a', duration: 1.5, ease: 'power2.inOut' }, 0.5);
    tl.to(borders,   { borderColor: 'rgba(0,0,0,0.1)', duration: 1, ease: 'power2.inOut' }, 0.5);

    /* Stage 3 — columns → text 전환 */
    tl.to(columnsLayer, { opacity: 0, scale: 0, duration: 3, ease: 'power2.inOut' }, 3);
    tl.to(textLayer,    { opacity: 1, duration: 0.8, ease: 'power2.inOut' }, 4);

    /* Stage 4 — MMCA 글자 분리 */
    tl.to('#part_mm', { ...FINAL.mm, duration: 1, ease: 'power3.inOut' }, 5);
    tl.to('#part_c',  { ...FINAL.c,  duration: 1, ease: 'power3.inOut' }, 5);
    tl.to('#part_a',  { ...FINAL.a,  duration: 1, ease: 'power3.inOut' }, 5);

    /* Stage 5 — 로고 전환 */
    tl.to(textLayer,   { opacity: 0, scale: 0.6, duration: 1, ease: 'power2.inOut' }, 7);
    tl.to(shapesLayer, { opacity: 1, duration: 3, ease: 'power2.inOut' }, 7.5);

    /* Stage 6 — 로고 깜빡임 */
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
      document.body.classList.add('is_ready');

      ScrollTrigger.create({
        trigger: '.scroll_spacer',
        start: '85% top',
        onEnter: () => {
          const orange = document.querySelector('.logo_orange');
          let isOrange = false;
          let count = 0;
          const maxCount = 4;

          const interval = setInterval(() => {
            isOrange = !isOrange;
            gsap.to(orange, { opacity: isOrange ? 1 : 0, duration: 0.5 });
            count++;
            if (count >= maxCount) clearInterval(interval);
          }, 500);
        },
        once: true,
      });
    });
  }

  buildTimeline();

ScrollTrigger.create({
  trigger: '.scroll_spacer',
  start: '95% top',
  onEnter: () => {
    gsap.to('#intro_wrapper', {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        window.location.href = 'main.html';
      }
    });
  },
  once: true,
});
document.getElementById('skip_btn').addEventListener('click', () => {
  // 인트로 즉시 페이드아웃 후 main.html로 이동
  gsap.to('#intro_wrapper', {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.inOut',
    onComplete: () => {
      window.location.href = 'main.html';
    }
  });
});

  /* ── 리사이즈 시 타임라인 재생성 (debounce) ── */
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildTimeline, 200);
  });

});