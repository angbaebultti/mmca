document.addEventListener("DOMContentLoaded", () => {

  /* =============================================
     1번+6번: 가로 스크롤
  ============================================= */
  (function initHorizontalScroll() {
    const wrapper = document.getElementById('artist_section');
    const track   = document.getElementById('horizontalTrack');
    if (!wrapper || !track) return;

    const TOTAL_SLIDES = 4;
    let currentIndex = 0;

    function getScrollProgress() {
      const wrapperTop  = wrapper.getBoundingClientRect().top;
      const scrolled    = -wrapperTop;
      const scrollableH = wrapper.offsetHeight - window.innerHeight;
      return Math.min(Math.max(scrolled / scrollableH, 0), 1);
    }

    function applySlide(progress) {
      const rawIndex = progress * (TOTAL_SLIDES - 1);
      const newIndex = Math.round(rawIndex);
      if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        updateDots(currentIndex);
      }
      const movePercent = -(currentIndex * (100 / TOTAL_SLIDES));
      track.style.transform = `translateX(${movePercent}%)`;
    }

    function updateDots(activeIndex) {
      document.querySelectorAll('.artist_slide').forEach((slide) => {
        slide.querySelectorAll('.dot').forEach((dot, dotIdx) => {
          dot.classList.toggle('active', dotIdx === activeIndex);
        });
      });
    }

    window.addEventListener('scroll', () => {
      applySlide(getScrollProgress());
    }, { passive: true });

    document.querySelectorAll('.skip_btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const historyEl = document.getElementById('history_skip');
        if (historyEl) historyEl.scrollIntoView({ behavior: 'smooth' });
      });
    });
  })();


  /* scroll down 이거 코드펜인데 얘가 제이쿼리라 오류생겨서 주석시킴*/
/*   $(function() {
    $('a[href*=#]').on('click', function(e) {
      e.preventDefault();
      $('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top }, 500, 'linear');
    });
  }); */


  /* =============================================
     2번: History 슬라이더 레버
  ============================================= */
  (function initHistorySlider() {
    const track     = document.getElementById('historyTrack');
    const trackWrap = document.getElementById('sliderTrackWrap');
    const thumb     = document.getElementById('sliderThumb');
    if (!track || !trackWrap || !thumb) return;

    const posters       = track.querySelectorAll('.poster_item');
    const TOTAL_POSTERS = posters.length;
    const MIN_PERCENT   = 1 / (TOTAL_POSTERS + 1);
    let isDragging      = false;
    let currentPercent  = MIN_PERCENT;

    function applyPosition(percent) {
      currentPercent = Math.min(Math.max(percent, MIN_PERCENT), 1);

      // 레버 위치
      const trackW = trackWrap.offsetWidth;
      thumb.style.left = (currentPercent * trackW) + 'px';

      // 트랙 이동: MIN_PERCENT → 0(2025보임), 1 → 최대(2012보임)
      const normalized = (currentPercent - MIN_PERCENT) / (1 - MIN_PERCENT);

      const posterW   = posters[0].offsetWidth + 20;
      const totalW    = TOTAL_POSTERS * posterW;
      const section   = track.closest('.history_section');
      const style     = getComputedStyle(section);
      const visibleW  = section.offsetWidth
                        - parseFloat(style.paddingLeft)
                        - parseFloat(style.paddingRight);
      const maxOffset = Math.max(0, totalW - visibleW);
      track.style.transform = `translateX(-${normalized * maxOffset}px)`;
    }

    function handleMove(clientX) {
      const rect    = trackWrap.getBoundingClientRect();
      const percent = (clientX - rect.left) / rect.width;
      applyPosition(percent);
    }

    trackWrap.addEventListener('pointerdown', (e) => {
      isDragging = true;
      thumb.setPointerCapture(e.pointerId);
      handleMove(e.clientX);
    });

    trackWrap.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    });

    trackWrap.addEventListener('pointerup', () => { isDragging = false; });
    trackWrap.addEventListener('lostpointercapture', () => { isDragging = false; });

  posters.forEach(poster => {
  const year = poster.querySelector('.poster_year');
  if (year && year.textContent.trim() === '2025') {
    poster.addEventListener('click', () => openModal());
  }
  });

    window.addEventListener('load', () => applyPosition(MIN_PERCENT));
    if (document.readyState === 'complete') applyPosition(MIN_PERCENT);
  })();


  /* =============================================
     3번: 모달
  ============================================= */
  function openModal() {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  (function initModal() {
    const overlay  = document.getElementById('modalOverlay');
    const panel    = document.getElementById('modalPanel');
    const closeBtn = document.getElementById('modalCloseBtn');
    if (!overlay || !panel || !closeBtn) return;

    overlay.addEventListener('click', (e) => {
      if (!panel.contains(e.target)) closeModal();
    });
    closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  })();


}); // DOMContentLoaded end