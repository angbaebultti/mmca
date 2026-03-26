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
    img.style.top = -300 - Math.random() * 300 + "px";
    img.style.width = 500 + Math.random() * 400 + "px";
    img.style.transform = `rotate(${gsap.utils.random(-30, 30)}deg)`;
    img.style.opacity = 0;
    img.style.filter = `blur(${2 + Math.random() * 3}px)`;
    ticket_bg.appendChild(img);
  }

  const tickets = qsa('.t');

  gsap.set(ticketLeft, { rotation: 0, x: 0, y: 0 });
  gsap.set(ticketRight, { rotation: 0, x: 0, y: 0 });

  gsap.to(ticketWrap, {
    duration: 1.4,
    ease: 'power3.out',
    delay: 0.4
  });

  const mainTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.main_visual',
      start: 'top+=600 top',
      end: '+=1500',
      scrub: 1.2
    }
  });

  mainTL.to(mainTitle, { opacity: 0, ease: 'power1.out' }, 0);
  mainTL.to(ticketLeft, { rotation: -25, x: -80, y: 40, ease: 'none' }, 0);
  mainTL.to(ticketRight, { rotation: 25, x: 80, y: 40, ease: 'none' }, 0);
  mainTL.to({}, { duration: 0.6 });
  mainTL.to(ticketLeft, { rotation: -60, x: -280, y: 700, opacity: 0.3, ease: "power3.in" }, 0.9);
  mainTL.to(ticketRight, { rotation: 30, x: 120, y: 400, opacity: 0.5, ease: "power2.out" }, 1.3);

  const aboutTL = gsap.timeline({
    scrollTrigger: {
      trigger: about,
      start: 'top 90%',
      end: '+=3000',
      scrub: 1.2
    }
  });

  aboutTL.to(aboutHero, { opacity: 0, scale: 0.92, ease: 'none' }, 0);

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

  aboutTL.to(aboutContent, { opacity: 1, y: 0, ease: 'none' }, 0.3);

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


  /* ─── ARTIST PRIZE : 카드 인터랙션 ─── */
  /* ─── ARTIST PRIZE : 카드 인터랙션 ─── */

  const cards = gsap.utils.toArray(".card");

  // 카드별 parallax 강도
  const depthMap = {
    "card_2025": 0.025,
    "card_2024": 0.018,
    "card_2023": 0.012,
    "card_2022": 0.020,
    "card_2021": 0.015
  };

  /* ================= FLOATING ================= */

  const floatTweens = new Map();

  cards.forEach((card) => {
    const tween = gsap.to(card, {
      y: `+=${gsap.utils.random(8, 18)}`,
      rotation: `+=${gsap.utils.random(0.5, 1.5)}`,
      repeat: -1,
      yoyo: true,
      duration: gsap.utils.random(2.5, 4),
      ease: "sine.inOut"
    });

    floatTweens.set(card, tween);
  });

  /* ================= 드래그 ================= */

  cards.forEach((card) => {
    let isDragging = false;
    let targetX = 0;
    let targetY = 0;

    let currentX = 0;
    let currentY = 0;

    card.addEventListener("mousedown", (e) => {
      isDragging = true;
      card.dataset.dragging = "true";

      floatTweens.get(card)?.pause();

      gsap.to(card, {
        scale: 1.08,
        duration: 0.2
      });

      card.style.zIndex = 9999;
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      targetX += e.movementX;
      targetY += e.movementY;
    });

    window.addEventListener("mouseup", () => {
      if (!isDragging) return;

      isDragging = false;
      card.dataset.dragging = "false";

      floatTweens.get(card)?.resume();

      gsap.to(card, {
        scale: 1,
        duration: 0.3
      });
    });

    // 🔥 핵심: ticker로 부드럽게 따라오게
    gsap.ticker.add(() => {
      if (!isDragging) return;

      currentX += (targetX - currentX) * 0.2;
      currentY += (targetY - currentY) * 0.2;

      gsap.set(card, {
        x: currentX,
        y: currentY
      });
    });
  });

  /* ================= 진입 애니 ================= */

  gsap.from(cards, {
    y: 180,
    opacity: 0,
    scale: 0.88,
    rotation: () => gsap.utils.random(-14, 14),
    stagger: { each: 0.1, from: "random" },
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".artist_prize",
      start: "top 70%",
    }
  });

  /* ================= PARALLAX ================= */

  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX - window.innerWidth / 2;
    mouseY = e.clientY - window.innerHeight / 2;
  });

  gsap.ticker.add(() => {
    curX += (mouseX - curX) * 0.06;
    curY += (mouseY - curY) * 0.06;

    cards.forEach((card) => {
      if (card.dataset.hovered === "true" || card.dataset.dragging === "true") return;

      const key = [...card.classList].find(c => depthMap[c]);
      const f = key ? depthMap[key] : 0.015;

      gsap.set(card, {
        x: curX * f,
        y: curY * f,
      });
    });
  });

  /* ================= TILT + SHINE ================= */

  cards.forEach((card) => {
    const shine = card.querySelector(".shine");

    card.addEventListener("mouseenter", () => {
      card.dataset.hovered = "true";
      if (shine) gsap.to(shine, { opacity: 1, duration: 0.3 });
    });

    card.addEventListener("mousemove", (e) => {
      if (card.dataset.dragging === "true") return; // 🔥 드래그 중 tilt 막기

      const rect = card.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const rotX = ((cy / rect.height) - 0.5) * -20;
      const rotY = ((cx / rect.width) - 0.5) * 20;

      gsap.to(card, {
        rotationX: rotX,
        rotationY: rotY,
        scale: 1.04,
        transformPerspective: 700,
        ease: "power2.out",
        duration: 0.3,
      });

      if (shine) {
        gsap.to(shine, {
          background: `radial-gradient(circle at ${(cx / rect.width) * 100}% ${(cy / rect.height) * 100}%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
          duration: 0.2,
        });
      }
    });

    card.addEventListener("mouseleave", () => {
      card.dataset.hovered = "false";

      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        duration: 0.5,
        ease: "power3.out",
      });

      if (shine) gsap.to(shine, { opacity: 0, duration: 0.4 });
    });
  });


  const lines = gsap.utils.toArray(".line");
  const letters = gsap.utils.toArray(".title_main span");

  const masterTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".artist_prize",
      start: "top top",
      end: "+=2000",
      scrub: 1,
      pin: true,
      anticipatePin: 1
    }
  });

  lines.forEach((line, i) => {
    const spans = line.querySelectorAll("span");
    masterTL.to(spans, {
      color: "#fff",
      stagger: 0.05,
      ease: "none"
    }, i * 0.15);
  });

  masterTL.to({}, { duration: 0.5 });
  masterTL.to(letters, {
    x: () => gsap.utils.random(-150, 150),
    y: () => gsap.utils.random(-150, 150),
    rotation: () => gsap.utils.random(-50, 50),
    opacity: 0,
    filter: "blur(6px)",
    stagger: { each: 0.03, from: "random" },
    ease: "power2.out"
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
      groups.forEach((g) => g.classList.remove('is-active', 'is-dimmed'));
    });
  });

  const newsInner = document.querySelector('.news_inner');
  newsInner.addEventListener('mouseleave', () => {
    groups.forEach((g) => g.classList.remove('is-active', 'is-dimmed'));
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