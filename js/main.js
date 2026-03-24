document.addEventListener('DOMContentLoaded', () => {
 gsap.registerPlugin(ScrollTrigger);
 
/* ─────────────────────────────────────────
   헬퍼
───────────────────────────────────────── */
const qs  = (sel)       => document.querySelector(sel);
const qsa = (sel)       => document.querySelectorAll(sel);
 
/* ─────────────────────────────────────────
   요소 참조
───────────────────────────────────────── */
const ticketWrap  = qs('.ticket');
const ticketLeft  = qs('.ticket_left');
const ticketRight = qs('.ticket_right');
const mainTitle   = qs('.main_title');
const aboutHero   = qs('.about_hero');
const aboutContent = qs('.about_content');
const stats       = qsa('.stat');
const ticketBgItems = qsa('.t');
 
/* ─────────────────────────────────────────
   1. 메인 비주얼 – 티켓이 오른쪽에서 슬라이드인
      (스크롤 없이 페이지 로드 시 바로 등장)
───────────────────────────────────────── */
function initTicketSlideIn() {
  // 초기: ticket 컨테이너는 right: -660px (CSS 기본값)
  gsap.to(ticketWrap, {
    right: 60,
    duration: 1.4,
    ease: 'power3.out',
    delay: 0.4,
  });
}
 
/* ─────────────────────────────────────────
   2. 스크롤 → 티켓 찢기 + 메인→어바웃 전환
───────────────────────────────────────── */
function initTicketTear() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.main_visual',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2,
    },
  });
 
  /* 타이틀 서서히 사라짐 */
  tl.to(mainTitle, { opacity: 0, y: -30, ease: 'none' }, 0);
 
  /* 티켓 찢기: 왼쪽 조각은 왼쪽-아래, 오른쪽은 오른쪽-아래로 벌어짐 */
  tl.to(ticketLeft, {
    rotation: -25,
    x: -120,
    y: 200,
    opacity: 0.6,
    ease: 'none',
  }, 0);
 
  tl.to(ticketRight, {
    rotation: 18,
    x: 80,
    y: 180,
    opacity: 0.6,
    ease: 'none',
  }, 0);
}
 
/* ─────────────────────────────────────────
   3. About – hero 텍스트 fadeout → content 등장
───────────────────────────────────────── */
function initAboutReveal() {
  const aboutSection = qs('.about');
 
  /* ── 3-A: hero 텍스트 fadeout (첫 번째 스크롤 구간) ── */
  gsap.to(aboutHero, {
    opacity: 0,
    scale: 0.92,
    ease: 'none',
    scrollTrigger: {
      trigger: aboutSection,
      start: 'top top',
      end: '30% top',   /* 전체 about 높이(300vh)의 30% 지점까지 fade */
      scrub: 1,
    },
  });
 
  /* ── 3-B: about_content 등장 (두 번째 스크롤 구간) ── */
  gsap.to(aboutContent, {
    opacity: 1,
    y: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: aboutSection,
      start: '28% top',
      end: '50% top',
      scrub: 1,
    },
  });
 
  /* ── 3-C: stat 원형 순차 등장 ── */
  stats.forEach((stat, i) => {
    gsap.to(stat, {
      opacity: 1,
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: aboutSection,
        start: `${38 + i * 4}% top`,
        end:   `${52 + i * 4}% top`,
        scrub: 1,
      },
    });
  });
}
 
/* ─────────────────────────────────────────
   4. About – 찢어진 티켓들이 위에서 바닥으로 쌓임
───────────────────────────────────────── */
function initFallingTickets() {
  const aboutSection  = qs('.about');
  const aboutScene    = qs('.about_scene');
  const sceneH        = aboutScene.offsetHeight; // 100vh
 
  /* 각 티켓의 최종 y 위치 (씬 바닥 근처에 쌓이는 느낌) */
  const finalPositions = [
    { y: sceneH * 0.72, rotate: -18, x: -30 },
    { y: sceneH * 0.68, rotate:  10, x:  40 },
    { y: sceneH * 0.75, rotate:  22, x: -60 },
    { y: sceneH * 0.70, rotate: -12, x:  20 },
    { y: sceneH * 0.73, rotate:   6, x: -20 },
  ];
 
  ticketBgItems.forEach((ticket, i) => {
    const pos = finalPositions[i];
 
    gsap.to(ticket, {
      opacity: 0.55,
      y: pos.y,
      x: pos.x,
      rotation: pos.rotate,
      ease: 'none',
      scrollTrigger: {
        trigger: aboutSection,
        start: `${5  + i * 6}% top`,
        end:   `${45 + i * 4}% top`,
        scrub: 1.5,
      },
    });
  });
}
 
/* ─────────────────────────────────────────
   초기화
───────────────────────────────────────── */
function init() {
  initTicketSlideIn();
  initTicketTear();
  initAboutReveal();
  initFallingTickets();
}
 
/* DOM ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
});
//dom end