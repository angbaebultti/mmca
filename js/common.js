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

museumNav.classList.remove('nav_locked');

items.forEach(item => {
    item.querySelector('.bg').style.transition = 'none';
});

const fillTL = gsap.timeline();

items.forEach((item, i) => {
    fillTL.fromTo(
        item.querySelector('.bg'),
        { width: '0%' },
        { width: '100%', duration: 0.9, ease: 'power3.out' },
        i * 0.3
    );
});

fillTL.to(museumNav, {
    height: 0,
    duration: 0.6,
    ease: 'power2.inOut',
    overflow: 'hidden',
     borderTopWidth: 0,      // ✅ 추가
    borderBottomWidth: 0, 
}, '+=0.5');

fillTL.to(header, {
    height: header.offsetHeight - navHeight,
    duration: 0.6,
    ease: 'power2.inOut',
}, '<');

fillTL.set(museumNav, {
    display: 'none',
});
});
//dom end