document.addEventListener("DOMContentLoaded", () => {

/* =============================================
   1번+6번: 가로 스크롤
   원리: wrapper 높이(500vh) 만큼 스크롤하는 동안
         sticky로 고정된 내부에서 translateX로 슬라이드 전환
============================================= */
(function initHorizontalScroll() {
  const wrapper = document.getElementById('artist_section');
  const track   = document.getElementById('horizontalTrack');
  if (!wrapper || !track) return;
 
  const TOTAL_SLIDES = 4;
  let currentIndex  = 0;
 
  /* 스크롤 진행률 0~1 계산 */
  function getScrollProgress() {
    const wrapperTop    = wrapper.getBoundingClientRect().top;
    const scrolled      = -wrapperTop;                        // 양수 = 아래로 내림
    const scrollableH   = wrapper.offsetHeight - window.innerHeight;
    return Math.min(Math.max(scrolled / scrollableH, 0), 1);
  }
 
  /* 진행률 → 슬라이드 인덱스 → translateX 적용 */
  function applySlide(progress) {
    const rawIndex = progress * (TOTAL_SLIDES - 1);
    const newIndex = Math.round(rawIndex);
 
    if (newIndex !== currentIndex) {
      currentIndex = newIndex;
      updateDots(currentIndex);
    }
 
    // horizontal_track width = 400% → 한 슬라이드 이동 = 100% / TOTAL_SLIDES
    const movePercent = -(currentIndex * (100 / TOTAL_SLIDES));
    track.style.transform = `translateX(${movePercent}%)`;
  }
 
  /* 인디케이터 점 업데이트 */
  function updateDots(activeIndex) {
    document.querySelectorAll('.artist_slide').forEach((slide, slideIdx) => {
      slide.querySelectorAll('.dot').forEach((dot, dotIdx) => {
        dot.classList.toggle('active', dotIdx === activeIndex);
      });
    });
  }
 
  window.addEventListener('scroll', () => {
    applySlide(getScrollProgress());
  }, { passive: true });
 
  /* skip 버튼: wrapper 끝(= history 섹션 직전)으로 즉시 스크롤 */
  document.querySelectorAll('.skip_btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const history = document.getElementById('history');
      if (history) history.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();
 
 
/* =============================================
   2번: History 슬라이더 레버
   - 드래그로 포스터 트랙 이동
   - 2026(왼쪽 끝)까지는 레버가 가지 않도록 minPercent 제한
============================================= */
(function initHistorySlider() {
  const track          = document.getElementById('historyTrack');
  const trackWrap      = document.getElementById('sliderTrackWrap');
  const thumb          = document.getElementById('sliderThumb');
  if (!track || !trackWrap || !thumb) return;
 
  const posters        = track.querySelectorAll('.poster_item');
  const POSTER_W       = 160 + 20; // width + gap
  const TOTAL_POSTERS  = posters.length; // 14
 
  // 2026까지 못 가게: 레버 최소값 = 1/(총포스터+1) ≈ 2025 위치
  const MIN_PERCENT    = 1 / (TOTAL_POSTERS + 1);
 
  let isDragging = false;
  let currentPercent = MIN_PERCENT;
 
  /* 레버 위치(0~1) → 포스터 트랙 이동 */
  function applyPosition(percent) {
    currentPercent = Math.min(Math.max(percent, MIN_PERCENT), 1);
 
    const trackW     = trackWrap.offsetWidth;
    thumb.style.left = (currentPercent * trackW) + 'px';
 
    // 섹션 패딩 제외 가시 너비
    const visibleW   = track.closest('.history_section').offsetWidth - 80;
    const totalW     = TOTAL_POSTERS * POSTER_W;
    const maxOffset  = Math.max(0, totalW - visibleW);
    track.style.transform = `translateX(-${currentPercent * maxOffset}px)`;
  }
 
  /* 클릭/드래그 공통 좌표 처리 */
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
 
  trackWrap.addEventListener('pointerup',          () => { isDragging = false; });
  trackWrap.addEventListener('lostpointercapture', () => { isDragging = false; });
 
  /* 초기 위치: 2025(맨 왼쪽) */
  applyPosition(MIN_PERCENT);
 
  /* 포스터 클릭 → 모달 열기 */
  posters.forEach(poster => {
    poster.addEventListener('click', () => {
      if (typeof openModal === 'function') openModal();
    });
  });
})();
 
 
/* =============================================
   3번: 모달
   - 왼쪽 패널 슬라이드인
   - 패널 바깥(오른쪽 빈 영역) 클릭 시 닫힘
   - 내부 세로 스크롤은 CSS overflow-y: auto 로 처리
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
 
  /* 오버레이 클릭: 패널 바깥이면 닫힘 */
  overlay.addEventListener('click', (e) => {
    if (!panel.contains(e.target)) closeModal();
  });
 
  closeBtn.addEventListener('click', closeModal);
 
  /* ESC 키로도 닫힘 */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
})();






});