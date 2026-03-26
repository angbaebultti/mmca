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

  /* ================= 티켓 배경 생성 ================= */
  const ticket_bg = qs(".ticket_bg");

  for (let i = 0; i < 12; i++) {
    const img = document.createElement("img");
    img.src = "img/ticket_full.png";
    img.classList.add("t");
    img.style.left = Math.random() * 100 + "%";
    img.style.top = -300 - Math.random() * 300 + "px";
    img.style.width = 500 + Math.random() * 400 + "px";
    img.style.transform = `rotate(${gsap.utils.random(-30, 30)}deg)`;
    img.style.opacity = 0;
    img.style.filter = `blur(${2 + Math.random() * 3}px)`;
    ticket_bg.appendChild(img);
  }

  const tickets = qsa('.t');


  gsap.set(ticketLeft, {
    rotation: 0,
    x: 0,
    y: 0
  });

  gsap.set(ticketRight, {
    rotation: 0,
    x: 0,
    y: 0
  });

  /* ================= 티켓 등장 ================= */
  gsap.to(ticketWrap, {
    duration: 1.4,
    ease: 'power3.out',
    delay: 0.4
  });

  /* ================= 메인 티켓 연출 ================= */
  const mainTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.main_visual',
      start: 'top+=600 top',
      end: '+=1500',
      scrub: 1.2
    }
  });

  mainTL.to(mainTitle, {
    opacity: 0,
    ease: 'power1.out'
  }, 0);

  mainTL.to(ticketLeft, {
    rotation: -25,
    x: -80,
    y: 40,
    ease: 'none'
  }, 0);

  mainTL.to(ticketRight, {
    rotation: 25,
    x: 80,
    y: 40,
    ease: 'none'
  }, 0);

  mainTL.to({}, { duration: 0.6 });

  mainTL.to(ticketLeft, {
    rotation: -60,
    x: -280,
    y: 700,
    opacity: 0.3,
    ease: "power3.in"
  }, 0.9);

  mainTL.to(ticketRight, {
    rotation: 30,
    x: 120,
    y: 400,
    opacity: 0.5,
    ease: "power2.out"
  }, 1.3);

  /* ================= ABOUT ================= */
  const aboutTL = gsap.timeline({
    scrollTrigger: {
      trigger: about,
      start: 'top 90%',
      end: '+=3000',
      scrub: 1.2
    }
  });

  aboutTL.to(aboutHero, {
    opacity: 0,
    scale: 0.92,
    ease: 'none'
  }, 0);

  tickets.forEach((t, i) => {
    aboutTL.to(t, {
      opacity: 0.12,
      y: () => about.offsetHeight * 0.6,
      x: () => gsap.utils.random(-250, 250),
      rotation: () => gsap.utils.random(-60, 60),
      scale: () => gsap.utils.random(0.85, 1.1),
      ease: "power1.out"
    }, i * 0.18);
  });

  aboutTL.to(aboutContent, {
    opacity: 1,
    y: 0,
    ease: 'none'
  }, 0.3);

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

  /* ================= ARTIST ================= */
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

  const cards = gsap.utils.toArray(".card");

  gsap.from(cards, {
    y: 200,
    opacity: 0,
    scale: 0.9,
    rotation: () => gsap.utils.random(-12, 12),
    x: () => gsap.utils.random(-60, 60),
    stagger: { each: 0.12, from: "random" },
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".artist_prize",
      start: "top 70%",
    }
  });

  cards.forEach((card) => {
    gsap.to(card, {
      rotation: 0,
      y: -120,
      scale: 1,
      x: gsap.utils.random(-40, 40),
      ease: "none",
      scrollTrigger: {
        trigger: ".artist_prize",
        start: "top 40%",
        end: "top -20%",
        scrub: true
      }
    });
  });

  cards.forEach((card) => {
    gsap.to(card, {
      rotation: "+=2",
      repeat: -1,
      yoyo: true,
      duration: gsap.utils.random(2, 3),
      ease: "sine.inOut"
    });
  });

  gsap.to(".card_2025", {
    rotation: 20,
    scrollTrigger: {
      trigger: ".artist_prize",
      scrub: true
    }
  });

  /* ================= NEWS ================= */
  const groups = Array.from(document.querySelectorAll('.news_group'));

  groups.forEach((target) => {
    target.addEventListener('mouseenter', () => {
      groups.forEach((g) => {
        if (g === target) {
          g.classList.add('is-active');
          g.classList.remove('is-dimmed');
        } else {
          g.classList.remove('is-active');
          g.classList.add('is-dimmed');
        }
      });
    });

    target.addEventListener('mouseleave', () => {
      // mouseleave가 다른 그룹으로 진입 시 튀는 것 방지:
      // relatedTarget이 다른 news_group 안에 있으면 무시
      groups.forEach((g) => {
        g.classList.remove('is-active', 'is-dimmed');
      });
    });
  });

  /* news_inner 자체에서 마우스가 완전히 빠져나갈 때만 초기화 */
  const newsInner = document.querySelector('.news_inner');
  newsInner.addEventListener('mouseleave', () => {
    groups.forEach((g) => {
      g.classList.remove('is-active', 'is-dimmed');
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
    x: 0,
    y: 0,
    scale: 0.5,
    opacity: 0,
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

  shop_tl.to(".p", {
    opacity: 0.7,
    scale: 0.6,
    duration: 0.25,
    ease: "power1.out"
  }, 0);

  document.querySelectorAll(".p").forEach((el, i) => {
    shop_tl.to(el, {
      opacity: 1,
      scale: 1,
      x: positions[i].x,
      y: positions[i].y,
      rotation: positions[i].r,
      ease: "expo.out",
      duration: 0.7
    }, 0.25);
  });

  shop_tl.to(".glass_front", {
    background: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 0 40px 20px rgba(255,255,255,0.4), 0 0 100px 40px rgba(255,255,255,0.2)",
    backdropFilter: "blur(0px)",
    duration: 0.4
  }, 0.25);

  shop_tl.to(".glass_front h2", { color: "#000", duration: 0.3 }, 0.3);
  shop_tl.to(".glass_front p", { color: "#555", duration: 0.3 }, 0.3);

  shop_tl.to(".glow_bg", {
    opacity: 0.7,
    scale: 1.8,
    filter: "blur(80px)",
    duration: 0.5
  }, 0.25);

  shop_tl.to(".glass_box", {
    scale: 1.04,
    z: 80,
    duration: 0.8,
    ease: "power3.out"
  }, 0.25);

  /* ================= CURSOR ================= */
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

  /* Magnetic — glass_box 전체 */
  const glassBox = document.querySelector('.glass_box');

  glassBox.addEventListener('mousemove', (e) => {
    const rect = glassBox.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(glassBox, {
      x: x * 0.08,
      y: y * 0.08,
      duration: 0.5,
      ease: 'power2.out'
    });
  });

  glassBox.addEventListener('mouseleave', () => {
    gsap.to(glassBox, {
      x: 0, y: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.4)'
    });
  });

  ScrollTrigger.create({
    trigger: newsSection,
    start: "top top",
    end: "+=1000",   // 이 600px 구간 동안 화면 고정
    pin: true,
    pinSpacing: true,
  });
});