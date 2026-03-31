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

    gsap.registerPlugin(ScrollTrigger);

    const items = document.querySelectorAll('.item');
    items.forEach((item, i) => {
        const bg = item.querySelector('.bg');
        gsap.fromTo(bg,
            { width: '0%' },
            {
                width: '100%',
                duration: 0.4,        // 0.8 → 0.4
                ease: 'power4.out',
                delay: 0.1 + i * 0.05,  // 0.2 + i * 0.1 → 더 빠르게
            }
        );
    });

    document.body.insertAdjacentHTML('beforeend', `
    <div class="cursor-ring" id="cursorRing">ENTER ↗</div>
    <div class="cursor-dot" id="cursorDot"></div>
  `);

    const ring = document.getElementById('cursorRing');
    const dot = document.getElementById('cursorDot');
    let mx = 0, my = 0, rx = window.innerWidth / 2, ry = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
    });

    (function lerpRing() {
        rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
        if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
        requestAnimationFrame(lerpRing);
    })();
});
//dom end