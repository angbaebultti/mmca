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

  // 티켓 생성(배경)
  const ticket_bg = qs(".ticket_bg");

  for (let i = 0; i < 12; i++) {
    const img = document.createElement("img");

    img.src = "img/ticket_full.png";
    img.classList.add("t");

    // 시작 위치 (화면 위)
    img.style.left = Math.random() * 100 + "%";
    img.style.top = -300 - Math.random() * 300 + "px";

    // 크기 크게
    img.style.width = 500 + Math.random() * 400 + "px";

    // 회전
    img.style.transform = `rotate(${gsap.utils.random(-30, 30)}deg)`;

    // 시작 안 보이게
    img.style.opacity = 0;

    // 블러
    img.style.filter = `blur(${2 + Math.random() * 3}px)`;

    ticket_bg.appendChild(img);
  }

  // 생성 후 가져오기
  const tickets = qsa('.t');

  // 티켓 슬라이드
  gsap.to(ticketWrap, {
    right: 60,
    duration: 1.4,
    ease: 'power3.out',
    delay: 0.4
  });

  // 티켓 찢기
  const mainTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.main_visual',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2
    }
  });

  mainTL.to(mainTitle, {
    opacity: 0,
    y: -30,
    ease: 'none'
  }, 0);

  mainTL.to(ticketLeft, {
    rotation: -25,
    x: -120,
    y: 200,
    opacity: 0.6,
    ease: 'none'
  }, 0);

  mainTL.to(ticketRight, {
    rotation: 18,
    x: 80,
    y: 180,
    opacity: 0.6,
    ease: 'none'
  }, 0);

  // about 타임라인
  const aboutTL = gsap.timeline({
    scrollTrigger: {
      trigger: about,
      start: 'top top',
      end: '+=2000',
      scrub: 1.2
    }
  });

  // hero 사라짐
  aboutTL.to(aboutHero, {
    opacity: 0,
    scale: 0.92,
    ease: 'none'
  }, 0);

  // 티켓 낙하(배경)
  tickets.forEach((t, i) => {
    aboutTL.to(t, {
      opacity: 0.12,
      y: () => about.offsetHeight * 0.9,
      x: () => gsap.utils.random(-300, 300),
      rotation: () => gsap.utils.random(-80, 80),
      ease: "power1.out"
    }, i * 0.15);
  });

  // 컨텐츠 등장

  aboutTL.to(aboutContent, {
    opacity: 1,
    y: 0,
    ease: 'none'
  }, 0.3);

  // 원 애니메이션
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

  // 라인
  ScrollTrigger.create({
    trigger: about,
    start: "45% top",
    end: "60% top",
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;
      document.querySelector(".line_left")
        .style.setProperty("--line-scale", p);
      document.querySelector(".line_right")
        .style.setProperty("--line-scale", p);
    }
  });

  // aritst 스크롤 하면 글씨 채워지게

  gsap.registerPlugin(ScrollTrigger);

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

  gsap.registerPlugin(ScrollTrigger);

  const cards = gsap.utils.toArray(".card");


  gsap.from(cards, {
    y: 200,
    opacity: 0,
    scale: 0.9,

    rotation: (i) => gsap.utils.random(-12, 12),
    x: (i) => gsap.utils.random(-60, 60),

    stagger: {
      each: 0.12,
      from: "random"
    },

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

  const groups = document.querySelectorAll('.news_group');

  groups.forEach((g, i) => {
    g.dataset.index = i;
  });

  groups.forEach((target) => {

    target.addEventListener('mouseenter', () => {

      groups.forEach((g) => {

        if (g === target) {
          g.style.zIndex = 9999;
          g.style.transform = 'translateY(-60px)';
        } else {
          g.style.transform = 'translateY(0)';
        }

      });

    });

    target.addEventListener('mouseleave', () => {

      groups.forEach((g) => {
        g.style.transform = 'translateY(0)';
        g.style.zIndex = '';
      });

    });

  });

  gsap.registerPlugin(ScrollTrigger);

  const positions = [
    { x: -580, y: -280, r: -15 },  // p1 - 왼쪽 상단
    { x: 120, y: -320, r: 10 },  // p2 - 중앙 상단
    { x: 560, y: -200, r: 20 },  // p3 - 오른쪽 상단
    { x: -620, y: 20, r: 8 },  // p4 - 왼쪽 중간
    { x: 600, y: 60, r: -12 },  // p5 - 오른쪽 중간
    { x: -480, y: 280, r: -20 },  // p6 - 왼쪽 하단
    { x: -80, y: 340, r: 5 },  // p7 - 중앙 하단
    { x: 380, y: 300, r: 18 },  // p8 - 오른쪽 하단
    { x: 620, y: 260, r: -10 },  // p9 - 오른쪽 하단2
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
});



