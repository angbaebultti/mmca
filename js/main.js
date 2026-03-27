document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const qs = (s) => document.querySelector(s);
  const qsa = (s) => document.querySelectorAll(s);

  const ticketWrap = qs('.ticket');
  const ticketLeft = qs('.ticket_left');
  const ticketRight = qs('.ticket_right');
  const mainTitle = qs('.main_title');
  const about = qs('.about');
  const aboutHero = qs('.about_hero');
  const aboutContent = qs('.about_content');
  const stats = qsa('.stat');

  const ticket_bg = qs(".ticket_bg");

  for (let i = 0; i < 12; i++) {
    const img = document.createElement("img");
    img.src = "img/ticket_full.png";
    img.classList.add("t");
    img.style.left = Math.random() * 100 + "%";
    img.style.top = -100 - Math.random() * 300 + "px";
    img.style.width = 500 + Math.random() * 400 + "px";
    img.style.transform = `rotate(${gsap.utils.random(-30, 30)}deg)`;
    img.style.opacity = 0;
    img.style.filter = `blur(${2 + Math.random() * 3}px)`;
    ticket_bg.appendChild(img);
  }

  const tickets = qsa('.t');

  gsap.set(ticketLeft, { rotation: 0, x: 0, y: 0 });
  gsap.set(ticketRight, { rotation: 0, x: 0, y: 0 });

  gsap.set(ticketWrap, { opacity: 0, x: 150, y: 0 });

  const mainTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.visual_inner',   // main_visual → visual_inner 로 변경
      start: 'top top',
      end: '+=1200',               // 찢어지는 구간만큼만
      scrub: 1.2,
      // pin: true  ← 이 줄 제거!
    }
  });
  mainTL.to(ticketWrap, { opacity: 1, x: 0, ease: 'power2.out', duration: 0.4 }, 0);
  mainTL.to(mainTitle, { opacity: 0, y: -30, ease: 'power1.out', duration: 0.3 }, 0.3);
  mainTL.to(ticketLeft, { rotation: -25, x: -150, y: 100, opacity: 0, ease: 'none', duration: 0.4 }, 0.35);
  mainTL.to(ticketRight, { rotation: 25, x: 150, y: 100, opacity: 0, ease: 'none', duration: 0.4 }, 0.35);

  const aboutScene = qs('.about_scene');
  const ticketBg = qs('.ticket_bg');
  aboutScene.prepend(ticketBg);

  // ticket_bg를 about_scene 바로 안으로 이동 (JS로 DOM 이동)

  const aboutTL = gsap.timeline({
    scrollTrigger: {
      trigger: about,
      start: 'top 80%',
      end: '+=2500',
      scrub: 1.2,
    }
  });

  // 1. 먼저 hero 텍스트 fade out
  aboutTL.to(aboutHero, { opacity: 0, scale: 0.92, ease: 'none', duration: 0.3 }, 0);

  // 2. 티켓들이 about_scene(sticky) 안에서 아래로 흘러내려 바닥에 쌓임
  tickets.forEach((t, i) => {
    gsap.set(t, {
      left: Math.random() * 80 + 10 + '%',  // 퍼센트로 재설정
      top: '-20%',
      position: 'absolute',
    });

    aboutTL.to(t, {
      opacity: 0.15,
      // about_scene 높이(100vh) 기준 하단 80% 지점에 쌓임
      y: () => window.innerHeight * (0.65 + Math.random() * 0.15),
      x: () => gsap.utils.random(-120, 120),
      rotation: () => gsap.utils.random(-35, 35),
      scale: () => gsap.utils.random(0.5, 0.85),
      ease: 'power2.out',
      duration: 0.5,
    }, 0.1 + i * 0.06);  // stagger 간격 줄여서 한꺼번에 우르르
  });

  // 3. 티켓 다 쌓인 후 about_content 등장
  aboutTL.to(aboutContent, { opacity: 1, y: 0, ease: 'none', duration: 0.3 }, 0.5);

  tickets.forEach((t, i) => {
    aboutTL.to(t, {
      opacity: 0.15,
      y: () => window.innerHeight * 0.8, // 화면 하단부에 쌓이도록
      x: () => (Math.random() - 0.5) * 400,
      rotation: () => gsap.utils.random(-40, 40),
      duration: 1,
    }, i * 0.05); // 순차적으로 낙하
  });

  aboutTL.to(aboutContent, { opacity: 1, y: 0 }, "-=0.5"); // 낙하 도중 등장

  stats.forEach((stat, i) => {
    gsap.to(stat, {
      opacity: 1,
      scale: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: about,
        start: `${40 + i * 4}% top`,
        end: `${55 + i * 4}% top`,
        scrub: 1
      }
    });
  });

  ScrollTrigger.create({
    trigger: about,
    start: "45% top",
    end: "60% top",
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;
      document.querySelector(".line_left").style.setProperty("--line-scale", p);
      document.querySelector(".line_right").style.setProperty("--line-scale", p);
    }
  });

  gsap.utils.toArray(".line").forEach((line, i) => {
    gsap.to(line.querySelectorAll("span"), {
      scrollTrigger: {
        trigger: ".artist_prize",
        start: `top+=${i * 150} 60%`,
        end: `top+=${i * 150} 30%`,
        scrub: true
      },
      color: "#fff",
      stagger: 0.08,
      ease: "none"
    });
  });



  const artist_cards = gsap.utils.toArray(".artist_card");
  const lines = gsap.utils.toArray(".line");
  const letters = gsap.utils.toArray(".title_main span");

  // 카드 초기 위치 세팅 — 오른쪽 밖에서 대기
  gsap.set(artist_cards, { opacity: 0, xPercent: 30 });

  function getScrollAmount() {
    const track = document.querySelector(".artist_track");
    return -(track.scrollWidth - window.innerWidth);
  }

  const masterTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".artist_prize",
      start: "top top",
      end: "+=4000",
      scrub: 1.2,
      pin: true,
      anticipatePin: 1,
    }
  });


  lines.forEach((line, i) => {
    const spans = line.querySelectorAll("span");
    masterTL.to(spans, {
      color: "#fff",
      stagger: 0.05,
      ease: "none",
      duration: 0.3,
    }, i * 0.15);
  });

  masterTL.to({}, { duration: 0.3 });

  masterTL.to(letters, {
    x: () => gsap.utils.random(-200, 200),
    y: () => gsap.utils.random(-200, 200),
    rotation: () => gsap.utils.random(-60, 60),
    opacity: 0,
    filter: "blur(8px)",
    stagger: { each: 0.02, from: "random" },
    ease: "power2.out",
    duration: 0.4,
  });

  masterTL.to({}, { duration: 0.2 });

  masterTL.to(artist_cards, {
    opacity: 1,
    xPercent: 0,
    stagger: 0.06,
    ease: "power3.out",
    duration: 0.4,
  });

  masterTL.to(".artist_track", {
    x: getScrollAmount,
    ease: "none",
    duration: 1,
  });

  /* ================= NEWS — Scroll Stack Open ================= */


  const groups = Array.from(document.querySelectorAll('.news_group'));

  // 처음엔 EVENTS만 열려있음
  groups[0].classList.add('is-open');

  groups.forEach((group) => {
    // news_head(탭)만 클릭 감지 — 열려있는 폴더 탭 클릭해도 닫히지 않음
    const head = group.querySelector('.news_head');

    head.addEventListener('click', () => {
      // 이미 열려있으면 무시
      if (group.classList.contains('is-open')) return;

      // 나머지 닫기
      groups.forEach((g) => g.classList.remove('is-open'));

      // 클릭한 폴더 열기
      group.classList.add('is-open');

      // 열린 폴더 상단으로 스크롤 (부드럽게)
      group.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  /* ================= SHOP ================= */

  const positions = [
    { x: -580, y: -280, r: -15 },
    { x: 120, y: -320, r: 10 },
    { x: 560, y: -200, r: 20 },
    { x: -620, y: 20, r: 8 },
    { x: 600, y: 60, r: -12 },
    { x: -480, y: 280, r: -20 },
    { x: -80, y: 340, r: 5 },
    { x: 380, y: 300, r: 18 },
    { x: 620, y: 260, r: -10 },
  ];

  gsap.set(".p", {
    x: 0, y: 0, scale: 0.5, opacity: 0,
    rotation: (i) => positions[i].r * 0.3,
  });

  const shop_tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".shop",
      start: "top top",
      end: "bottom top",
      scrub: 1.2
    }
  });

  shop_tl.to(".p", { opacity: 0.7, scale: 0.6, duration: 0.25, ease: "power1.out" }, 0);

  document.querySelectorAll(".p").forEach((el, i) => {
    shop_tl.to(el, {
      opacity: 1, scale: 1,
      x: positions[i].x, y: positions[i].y, rotation: positions[i].r,
      ease: "expo.out", duration: 0.7
    }, 0.25);
  });

  shop_tl.to(".glass_front", {
    background: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 0 40px 20px rgba(255,255,255,0.4), 0 0 100px 40px rgba(255,255,255,0.2)",
    backdropFilter: "blur(0px)", duration: 0.4
  }, 0.25);

  shop_tl.to(".glass_front h2", { color: "#000", duration: 0.3 }, 0.3);
  shop_tl.to(".glass_front p", { color: "#555", duration: 0.3 }, 0.3);
  shop_tl.to(".glow_bg", { opacity: 0.7, scale: 1.8, filter: "blur(80px)", duration: 0.5 }, 0.25);
  shop_tl.to(".glass_box", { scale: 1.04, z: 80, duration: 0.8, ease: "power3.out" }, 0.25);


  document.body.insertAdjacentHTML('beforeend', `
    <div class="cursor-ring" id="cursorRing">ENTER ↗</div>
    <div class="cursor-dot" id="cursorDot"></div>
  `);

  const ring = document.getElementById('cursorRing');
  const dot = document.getElementById('cursorDot');

  let mx = 0, my = 0;
  let rx = window.innerWidth / 2, ry = window.innerHeight / 2;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  (function lerpRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(lerpRing);
  })();

  const shopSection = document.querySelector('.shop');

  shopSection.addEventListener('mouseenter', () => {
    ring.classList.add('shop-hover');
    dot.style.opacity = '0';
  });
  shopSection.addEventListener('mouseleave', () => {
    ring.classList.remove('shop-hover');
    dot.style.opacity = '1';
  });

  const glassBox = document.querySelector('.glass_box');

  glassBox.addEventListener('mousemove', (e) => {
    const rect = glassBox.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(glassBox, { x: x * 0.08, y: y * 0.08, duration: 0.5, ease: 'power2.out' });
  });

  glassBox.addEventListener('mouseleave', () => {
    gsap.to(glassBox, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
  });

});