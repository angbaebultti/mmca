document.addEventListener('DOMContentLoaded', () => {

    /* ================= 햄버거 메뉴 ================= */
    const menuBtn = document.getElementById("menu_btn");
    const closeBtn = document.getElementById("close_btn");
    const menu = document.getElementById("menu");

    let scrollY = 0;

    menuBtn.addEventListener("click", () => {
        scrollY = window.scrollY;

        menu.classList.add("active");

        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%"; // 🔥 흔들림 방지
    });

    closeBtn.addEventListener("click", () => {
        menu.classList.remove("active");

        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";

        window.scrollTo(0, scrollY);
    });


    /* ================= TOP 버튼 ================= */
    const top_btn = document.querySelector('.top_btn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            top_btn.classList.add('active');
        } else {
            top_btn.classList.remove('active');
        }
    });


    /* ================= HEADER 인터랙션 ================= */
    const header = document.querySelector(".header");

    let lastScroll = 0;

    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 60) {
            header.classList.add("shrink");
        } else {
            header.classList.remove("shrink");
        }

        lastScroll = currentScroll;
    });


    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(".item .bg",
        {
            scaleY: 0,
            opacity: 0
        },
        {
            scaleY: 1,
            opacity: 1,
            duration: 0.6,
            ease: "power4.out",
            transformOrigin: "bottom",
            scrollTrigger: {
                trigger: ".nav",
                start: "bottom 85%",
                toggleActions: "play none none reverse"
            }
        }
    );
});
//dom end