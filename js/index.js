document.addEventListener('DOMContentLoaded', () => {

    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    gsap.registerPlugin(ScrollTrigger);

    const drawPaths = document.querySelectorAll('.draw-path');
    const waterRects = ['wr-m1', 'wr-m2', 'wr-c', 'wr-a'].map(id => document.getElementById(id));
    const dropM2 = document.getElementById('drop-m2');
    const dropA = document.getElementById('drop-a');
    const bgLayer = document.querySelector('.bg_layer');
    const columnsLayer = document.getElementById('columns_layer');
    const textLayer = document.getElementById('text_layer');
    const textMmca = document.getElementById('text_mmca');
    const shapesLayer = document.getElementById('shapes_layer');
    const scrollHint = document.getElementById('scroll_hint');
    const borders = document.querySelectorAll('.letter-cell:not(:last-child)');

    function clamp01(v) { return Math.min(Math.max(v, 0), 1); }
    function range(p, s, e) { return clamp01((p - s) / (e - s)); }
    function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

    function onScroll() {
        const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const s1 = easeOutExpo(range(p, 0, 2));
        drawPaths.forEach(path => { path.style.strokeDashoffset = 20000 * (1 - s1); });
        const sd = easeOutExpo(range(p, 0.05, 0.25));
        borders.forEach(b => { b.style.borderRightColor = `rgba(255,255,255,${sd})`; });
        const s2 = easeOutExpo(range(p, 0.05, 0.60));
        const waterY = 1200 + (-200 - 1200) * s2;
        waterRects.forEach(r => { if (r) r.setAttribute('y', waterY); });
        scrollHint.style.opacity = Math.max(0, 0.6 - range(p, 0, 0.03) * 3);

        if (p >= 0.60) {
            const crossbar = document.querySelector('.a-crossbar');
            if (crossbar) crossbar.remove();
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.scroll_spacer',
            start: '10% top',
            end: 'bottom bottom',
            scrub: 1,
        }
    });

    tl.to([dropM2, dropA], { y: '33vh', duration: 3, ease: 'power4.in' }, 0);
    tl.to(bgLayer, { opacity: 1, duration: 1, ease: 'power2.inOut' },);
    tl.to(drawPaths, { stroke: '#1a1a1a', duration: 1.5, ease: 'power2.inOut' }, 0.5);
    tl.to(borders, { borderColor: 'rgba(0,0,0,0.1)', duration: 1, ease: 'power2.inOut' }, 0.5);

    tl.to(columnsLayer, { opacity: 0, scale: 0, duration: 3, ease: 'power2.inOut' }, 3);
    tl.to(textLayer, { opacity: 1, duration: 0.8, ease: 'power2.inOut' }, 4);

    tl.to('#part_mm', { x: 0, y: 200, duration: 1, ease: 'power3.inOut' }, 5);
    tl.to('#part_c', { x: 25, y: 150, duration: 1, ease: 'power3.inOut' }, 5);
    tl.to('#part_a', { x: 351, y: -200, duration: 1, ease: 'power3.inOut' }, 5);

    /* Stage 6 */
    tl.to(textLayer, { opacity: 0, scale: 0.6, duration: 1, ease: 'power2.inOut' }, 7);
    tl.to(shapesLayer, { opacity: 1, duration: 3, ease: 'power2.inOut' }, 7.5);

    // 👉 추가
    tl.call(() => {
        window.location.href = "main.html";
    }, null, 10.5);

    document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
        document.body.classList.add('is_ready');

        ScrollTrigger.create({
            trigger: '.scroll_spacer',
            start: '85% top',
            onEnter: () => {
                const orange = document.querySelector('.logo_orange');
                let isOrange = false;
                let count = 0;
                const maxCount = 4;

                const interval = setInterval(() => {
                    isOrange = !isOrange;
                    gsap.to(orange, { opacity: isOrange ? 1 : 0, duration: 0.5 });
                    count++;

                    if (count >= maxCount) {
                        clearInterval(interval);
                    }
                }, 500);
            },
            once: true,
        });
    });

    window.addEventListener('resize', () => { ScrollTrigger.refresh(); });
});