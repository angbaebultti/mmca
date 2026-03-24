
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // 요소 정의
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
  const lines = qsa('.line');
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

  // about 전체 타임라인
  const aboutTL = gsap.timeline({
    scrollTrigger: {
      trigger: about,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2
    }
  });

  //  hero 사라짐
  aboutTL.to(aboutHero, {
    opacity: 0,
    scale: 0.92,
    ease: 'none'
  }, 0);

  // 배경 티켓 떨어지는 거 
  tickets.forEach((t, i) => {
    aboutTL.to(t, {
      opacity: 0.5,
      y: 600,
      x: gsap.utils.random(-60, 60),
      rotation: gsap.utils.random(-25, 25),
      ease: 'none'
    }, 0.1 + i * 0.05);
  });

  //   컨텐츠 등장
  aboutTL.to(aboutContent, {
    opacity: 1,
    y: 0,
    ease: 'none'
  }, 0.25);

  // 원 순서대로 나오는 거
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

  // 원 옆에 선
  ScrollTrigger.create({
    trigger: about,
    start: "45% top",
    end: "60% top",
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;
      console.log(p)
      document.querySelector(".line_left")
        .style.setProperty("--line-scale", p);
      document.querySelector(".line_right")
        .style.setProperty("--line-scale", p);
    }
  });

});