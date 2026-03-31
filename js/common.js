document.addEventListener('DOMContentLoaded', () => {

  /* ── 메뉴 ── */
  const menuBtn  = document.getElementById("menu_btn");
  const closeBtn = document.getElementById("close_btn");
  const menu     = document.getElementById("menu");
  let scrollY = 0;

  menuBtn.addEventListener("click", () => {
    scrollY = window.scrollY;
    menu.classList.add("active");
    document.body.classList.add("menu_open");
  });

  closeBtn.addEventListener("click", () => {
    menu.classList.remove("active");
    document.body.classList.remove("menu_open");
    window.scrollTo(0, scrollY);
  });

  /* ── 탑버튼 ── */
  const topBtn = document.querySelector('.top_btn');

  window.addEventListener('scroll', () => {
    topBtn.classList.toggle('active', window.scrollY > 300);
  });

  /* ── 헤더 shrink / hide ── */
  const header = document.querySelector(".header");
  let lastScroll    = 0;
  let scrollUpStart = 0;

  window.addEventListener("scroll", () => {
    const cur = window.scrollY;

    header.classList.toggle("shrink", cur > 60);

    if (cur > lastScroll && cur > 100) {
      header.classList.add("hide");
      scrollUpStart = cur;
    } else {
      if (scrollUpStart - cur > 60) {
        header.classList.remove("hide");
      }
    }

    lastScroll = cur;
  });

  /* ── museum nav GSAP 애니메이션 ── */
  const museumNav = document.querySelector('.museum_nav');
  const items     = document.querySelectorAll('.item');

  museumNav.classList.remove('nav_locked');
  items.forEach(item => {
    item.querySelector('.bg').style.transition = 'none';
  });

  const navHeight = museumNav.offsetHeight;

  const fillTl = gsap.timeline();

  items.forEach((item, i) => {
    fillTl.fromTo(
      item.querySelector('.bg'),
      { width: '0%' },
      { width: '100%', duration: 0.9, ease: 'power3.out' },
      i * 0.3
    );
  });

  fillTl.to(museumNav, {
    height: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    duration: 0.6,
    ease: 'power2.inOut',
    overflow: 'hidden',
  }, '+=0.5');

  fillTl.to(header, {
    height: header.offsetHeight - navHeight,
    duration: 0.6,
    ease: 'power2.inOut',
  }, '<');

  fillTl.set(museumNav, { display: 'none' });


}); // DOMContentLoaded end