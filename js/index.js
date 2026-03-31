document.addEventListener('DOMContentLoaded', () => {
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  gsap.registerPlugin(ScrollTrigger);

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const draw_paths = document.querySelectorAll('.draw-path');
  const water_rects = ['wr-m1', 'wr-m2', 'wr-c', 'wr-a'].map((id) =>
    document.getElementById(id)
  );
  const drop_m2 = document.getElementById('drop-m2');
  const drop_a = document.getElementById('drop-a');
  const bg_layer = document.querySelector('.bg_layer');
  const columns_layer = document.getElementById('columns_layer');
  const text_layer = document.getElementById('text_layer');
  const shapes_layer = document.getElementById('shapes_layer');
  const borders = document.querySelectorAll('.letter-cell:not(:last-child)');
  const skip_btn = document.getElementById('skip_btn');

  let tl = null;
  let is_redirecting = false;

  function clamp01(value) {
    return Math.min(Math.max(value, 0), 1);
  }

  function range(progress, start, end) {
    return clamp01((progress - start) / (end - start));
  }

  function ease_out_expo(value) {
    return value === 1 ? 1 : 1 - Math.pow(2, -10 * value);
  }

  function vw(value) {
    return (window.innerWidth * value) / 100;
  }

  function vh(value) {
    return (window.innerHeight * value) / 100;
  }

  function on_scroll() {
    const max_scroll =
      document.documentElement.scrollHeight - window.innerHeight;

    if (max_scroll <= 0) return;

    const progress = window.scrollY / max_scroll;

    const stage_1 = ease_out_expo(range(progress, 0, 2));
    draw_paths.forEach((path) => {
      path.style.strokeDashoffset = 20000 * (1 - stage_1);
    });

    const divider_progress = ease_out_expo(range(progress, 0.05, 0.25));
    borders.forEach((border) => {
      border.style.borderRightColor = `rgba(255,255,255,${divider_progress})`;
    });

    const stage_2 = ease_out_expo(range(progress, 0.05, 0.6));
    const water_y = 1200 + (-200 - 1200) * stage_2;

    water_rects.forEach((rect) => {
      if (rect) {
        rect.setAttribute('y', water_y);
      }
    });

    if (progress >= 0.6) {
      const crossbar = document.querySelector('.a-crossbar');
      if (crossbar) {
        crossbar.remove();
      }
    }
  }

  window.addEventListener('scroll', on_scroll, { passive: true });
  on_scroll();

  function go_to_main() {
    if (is_redirecting) return;
    is_redirecting = true;

    gsap.to('#intro_wrapper', {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        window.location.href = 'main.html';
      },
    });
  }

  if (skip_btn) {
    skip_btn.addEventListener('click', () => {
      go_to_main();
    });
  }

  function build_timeline() {
    if (tl) {
      tl.kill();
    }

    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    const init = {
      mm: { x: vw(-32), y: vh(-20), scale: 1 },
      c: { x: vw(2), y: vh(-20), scale: 1.05 },
      a: { x: vw(15), y: vh(-20), scale: 1.03 },
    };

    const final = {
      mm: { x: vw(-18), y: vh(-35), scale: 1 },
      c: { x: vw(-16), y: vh(-4), scale: 1.05 },
      a: { x: vw(0), y: vh(-4), scale: 1.03 },
    };

    gsap.set('#part_mm', init.mm);
    gsap.set('#part_c', init.c);
    gsap.set('#part_a', init.a);

    tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroll_spacer',
        start: '10% top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    tl.to(
      [drop_m2, drop_a],
      {
        y: '33vh',
        duration: 3,
        ease: 'power4.in',
      },
      0
    );

    tl.to(
      bg_layer,
      {
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut',
      },
      3
    );

    tl.to(
      draw_paths,
      {
        stroke: '#1a1a1a',
        duration: 1.5,
        ease: 'power2.inOut',
      },
      3.5
    );

    tl.to(
      borders,
      {
        borderColor: 'rgba(0,0,0,0.1)',
        duration: 1,
        ease: 'power2.inOut',
      },
      3.5
    );

    tl.to(
      columns_layer,
      {
        opacity: 0,
        scale: 0,
        duration: 3,
        ease: 'power2.inOut',
      },
      5
    );

    tl.to(
      text_layer,
      {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.inOut',
      },
      6
    );

    tl.to(
      '#part_mm',
      {
        ...final.mm,
        duration: 1,
        ease: 'power3.inOut',
      },
      7
    );

    tl.to(
      '#part_c',
      {
        ...final.c,
        duration: 1,
        ease: 'power3.inOut',
      },
      7
    );

    tl.to(
      '#part_a',
      {
        ...final.a,
        duration: 1,
        ease: 'power3.inOut',
      },
      7
    );

    tl.to(
      text_layer,
      {
        opacity: 0,
        scale: 0.6,
        duration: 1,
        ease: 'power2.inOut',
      },
      9
    );

    tl.to(
      shapes_layer,
      {
        opacity: 1,
        duration: 3,
        ease: 'power2.inOut',
      },
      9.5
    );

    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
      document.body.classList.add('is_ready');

      ScrollTrigger.create({
        trigger: '.scroll_spacer',
        start: '85% top',
        once: true,
        onEnter: () => {
          const orange_logo = document.querySelector('.logo_orange');
          if (!orange_logo) return;

          let is_orange = false;
          let count = 0;
          const max_count = 4;

          const interval_id = setInterval(() => {
            is_orange = !is_orange;

            gsap.to(orange_logo, {
              opacity: is_orange ? 1 : 0,
              duration: 0.5,
            });

            count += 1;

            if (count >= max_count) {
              clearInterval(interval_id);
            }
          }, 500);
        },
      });

      ScrollTrigger.create({
        trigger: '.scroll_spacer',
        start: 'top top',
        end: 'bottom bottom',
        once: true,
        onLeave: () => {
          go_to_main();
        },
      });
    });
  }

  build_timeline();

  let resize_timer = null;

  window.addEventListener('resize', () => {
    clearTimeout(resize_timer);
    resize_timer = setTimeout(() => {
      build_timeline();
    }, 200);
  });
});