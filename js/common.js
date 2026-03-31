document.addEventListener('DOMContentLoaded', () => {

    const menuBtn = document.getElementById("menu_btn");
    const closeBtn = document.getElementById("close_btn");
    const menu = document.getElementById("menu");

    let scrollY = 0;

    menuBtn.addEventListener("click", () => {
        scrollY = window.scrollY;

        menu.classList.add("active");

        document.body.classList.add("menu_open");
        /* document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";  */
    });

    closeBtn.addEventListener("click", () => {
        menu.classList.remove("active");
        document.body.classList.remove("menu_open");
        window.scrollTo(0, scrollY);
        /*         menu.classList.remove("active");
        
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";
        
                window.scrollTo(0, scrollY); */
    });


    const top_btn = document.querySelector('.top_btn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            top_btn.classList.add('active');
        } else {
            top_btn.classList.remove('active');
        }
    });



    const header = document.querySelector(".header");

    let lastScroll = 0;
    let scrollUpStart = 0;

    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 60) {
            header.classList.add("shrink");
        } else {
            header.classList.remove("shrink");
        }

        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.add("hide");
            scrollUpStart = currentScroll;
        } else {
            if (scrollUpStart - currentScroll > 60) {
                header.classList.remove("hide");
            }
        }

        lastScroll = currentScroll;
    });

    // gsap.registerPlugin(ScrollTrigger);

 const museumNav = document.querySelector('.museum_nav');
const items = document.querySelectorAll('.item');
const mainContent = document.querySelector('main'); // hero 섹션 바로 위 부모 or 첫 섹션

museumNav.classList.remove('nav_locked');

items.forEach(item => {
    item.querySelector('.bg').style.transition = 'none';
});

const navHeight = museumNav.offsetHeight;

// ✅ 콘텐츠에 nav 높이만큼 margin 미리 부여
mainContent.style.marginTop = navHeight + 'px';

const fillTL = gsap.timeline();

items.forEach((item, i) => {
    fillTL.fromTo(
        item.querySelector('.bg'),
        { width: '0%' },
        { width: '100%', duration: 0.9, ease: 'power3.out' },
        i * 0.3
    );
});

// ✅ nav 올라가면서 margin도 동시에 줄어듦 → 빈 공간 없음
fillTL.to(museumNav, {
    yPercent: -100,
    duration: 0.7,
    ease: 'power2.inOut',
}, '+=0.5');

fillTL.to(mainContent, {
    marginTop: 0,
    duration: 0.7,
    ease: 'power2.inOut',
}, '<'); // ✅ '<' 로 nav랑 동시에 실행

fillTL.set(museumNav, {
    display: 'none',
});

});
//dom end