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

// ✅ nav_locked 제거 (CSS에서 bg width를 0으로 강제하던 클래스)
museumNav.classList.remove('nav_locked');

// hover transition 차단 (GSAP 애니메이션 충돌 방지)
items.forEach(item => {
    item.querySelector('.bg').style.transition = 'none';
});

const fillTL = gsap.timeline({
    onComplete: () => {
        // 애니메이션 완료 후 hover transition 복원
        items.forEach(item => {
            item.querySelector('.bg').style.transition = 'width 0.6s cubic-bezier(0.65, 0, 0.35, 1)';
        });
    }
});

items.forEach((item, i) => {
    fillTL.fromTo(
        item.querySelector('.bg'),
        { width: '0%' },
        { width: '100%', duration: 0.9, ease: 'power3.out' },
        i * 0.3
    );
});

// ✅ 추가: 슬라이드 아웃 전에 bg를 다시 0으로 되돌리기
fillTL.to(
    Array.from(items).map(item => item.querySelector('.bg')),
    { width: '0%', duration: 0.4, ease: 'power2.in', stagger: 0.05 },
    '+=0.3'  // 채우기 완료 후 0.3s 뒤에 빠르게 빠짐
);

// 그 다음 위로 슬라이드 아웃
fillTL.to(museumNav, {
    y: '-100%',
    opacity: 0,
    duration: 0.6,
    ease: 'power2.inOut',
}, '+=0.1');

// 슬라이드 아웃 완료 후 공간 제거
fillTL.set(museumNav, {
    height: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    visibility: 'hidden',
});

});
//dom end