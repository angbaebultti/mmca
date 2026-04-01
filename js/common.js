document.addEventListener("DOMContentLoaded", () => {
  const userName = sessionStorage.getItem("userName");
  const signInLink = document.querySelector(".gnb_r a[href='signin.html']");

  if (userName && signInLink) {
    signInLink.outerHTML = `
      <a href="#" class="user_icon_btn" title="${userName}">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </a>
    `;

    document.querySelector(".user_icon_btn").addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm(`${userName}\nLog out?`)) {
        sessionStorage.clear();
        location.href = "signin.html";
      }
    });
  }

  /* ── 메뉴 ── */
  const menuBtn = document.getElementById("menu_btn");
  const closeBtn = document.getElementById("close_btn");
  const menu = document.getElementById("menu");
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
  let lastScroll = 0;
  let headerLockedByIntro = false;
  let introDone = false; // 추가

  window.addEventListener("scroll", () => {
    if (headerLockedByIntro) return;

    const cur = window.scrollY;

    if (!introDone) {
      // 인트로 전엔 기존 로직 유지
      header.classList.toggle("shrink", cur > 10);
      if (cur > lastScroll && cur > 100) header.classList.add("hide");
      else if (lastScroll - cur > 10) header.classList.remove("hide");
      lastScroll = cur;
      return;
    }

    // 인트로 완료 후: shrink 헤더만 운용
    header.classList.add("shrink");

    if (cur > lastScroll && cur > 100) {
      header.classList.add("hide");
    } else if (lastScroll - cur > 60 && cur > 0) {
      // cur > 0 조건으로 맨 위 깜빡임 방지
      header.classList.remove("hide");
    } else if (cur === 0) {
      header.classList.remove("hide");
    }

    lastScroll = cur;
  });
  /* ── museum nav GSAP 애니메이션 ── */
  const museumNav = document.querySelector('.museum_nav');
  const items = document.querySelectorAll('.item');

  if (museumNav && items.length > 0) {
    headerLockedByIntro = true;

    museumNav.classList.remove('nav_locked');
    items.forEach(item => {
      item.querySelector('.bg').style.transition = 'none';
    });

    const fillTl = gsap.timeline();

    items.forEach((item, i) => {
      fillTl.fromTo(
        item.querySelector('.bg'),
        { width: '0%' },
        { width: '100%', duration: 0.9, ease: 'power3.out' },
        i * 0.3
      );
    });

    fillTl.to(header, {
      yPercent: -100,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
    }, '+=0.5');

    fillTl.call(() => {
      gsap.set(header, { clearProps: 'transform,opacity' });
      header.classList.add('hide');
      header.classList.add('shrink'); // 추가

      lastScroll = window.scrollY;
      headerLockedByIntro = false;
      introDone = true; // 추가
    });

  } else {
    header.classList.add('hide');
  }

}); // DOMContentLoaded end