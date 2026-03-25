// 카멜표기법 사용
// 주석으로 어떤 트리거인지 적어주기
 
document.addEventListener('DOMContentLoaded', () => {
 
  /* ─── State ──────────────────────────────────────────────── */
  const state = {
    year: 2026,
    month: 2,
    selectedDay: 30,
    selectedTime: '10:00~18:00',
    counts: { adult: 1, student: 0, senior: 0, culture: 0 },
  };
 
  const MONTHS = [
    'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
    'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'
  ];
 
  /* ─── 달력 렌더 ─────────────────────────────────────────── */
  function renderCalendar() {
    const grid = document.getElementById('cal_days');
    if (!grid) return;
    grid.innerHTML = '';
 
    const { year, month, selectedDay } = state;
    const firstDay     = new Date(year, month, 1).getDay();
    const daysInMonth  = new Date(year, month + 1, 0).getDate();
    const daysInPrev   = new Date(year, month, 0).getDate();
 
    const label = document.querySelector('.cal_month_label');
    if (label) label.textContent = `${MONTHS[month]}    ${year}`;
 
    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, type: 'prev' });
    for (let d = 1; d <= daysInMonth; d++)   cells.push({ day: d, type: 'current' });
    const rem = 7 - (cells.length % 7);
    if (rem < 7) for (let d = 1; d <= rem; d++) cells.push({ day: d, type: 'next' });
 
    for (let r = 0; r < Math.ceil(cells.length / 7); r++) {
      const row = document.createElement('div');
      row.className = 'cal_week_row';
      for (let c = 0; c < 7; c++) {
        const cell = cells[r * 7 + c];
        if (!cell) break;
        const el = document.createElement('div');
        el.className = 'cal_day';
        el.textContent = cell.day;
        if (cell.type !== 'current') {
          el.classList.add('other-month');
        } else {
          if (cell.day === selectedDay) el.classList.add('selected');
          el.addEventListener('click', () => {
            state.selectedDay = cell.day;
            renderCalendar();
            updateSummary();
          });
        }
        row.appendChild(el);
      }
      grid.appendChild(row);
    }
  }
 
  /* ─── 달력 네비게이션 ──────────────────────────────────── */
  function initCalNav() {
    const prev = document.querySelector('.cal_prev');
    const next = document.querySelector('.cal_next');
    const drop = document.querySelector('.cal_dropdown');
 
    prev && prev.addEventListener('click', () => {
      state.month--;
      if (state.month < 0) { state.month = 11; state.year--; }
      state.selectedDay = 1;
      renderCalendar(); updateSummary();
    });
    next && next.addEventListener('click', () => {
      state.month++;
      if (state.month > 11) { state.month = 0; state.year++; }
      state.selectedDay = 1;
      renderCalendar(); updateSummary();
    });
    drop && drop.addEventListener('click', () => {
      state.month = (state.month + 1) % 12;
      state.selectedDay = 1;
      renderCalendar(); updateSummary();
    });
  }
 
  /* ─── 시간 선택 버튼 ──────────────────────────────────── */
  function initTimeButtons() {
    const btns = document.querySelectorAll('.time_btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedTime = btn.dataset.time;
        updateSummary();
      });
    });
  }
 
  /* ─── 방문객 카운트 ───────────────────────────────────── */
  function initCountButtons() {
    document.querySelectorAll('.count_btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        const delta  = btn.classList.contains('plus') ? 1 : -1;
        const min    = target === 'adult' ? 1 : 0;
        state.counts[target] = Math.max(min, state.counts[target] + delta);
        const el = document.getElementById(`${target}_count`);
        if (el) el.textContent = state.counts[target];
        updateSummary();
      });
    });
  }
 
  /* ─── Summary 업데이트 ────────────────────────────────── */
  function updateSummary() {
    const { year, month, selectedDay, selectedTime, counts } = state;
    const monthAbbr = MONTHS[month].slice(0, 3).toLowerCase();
    const time      = selectedTime.split('~')[0];
    const dateEl   = document.getElementById('summary_date');
    const ticketEl = document.getElementById('summary_ticket');
    if (dateEl)   dateEl.textContent   = `${monthAbbr} ${String(selectedDay).padStart(2,'0')} · ${year} · ${time}`;
    if (ticketEl) {
      const parts = [];
      if (counts.adult)   parts.push(`adult · ${counts.adult} ticket${counts.adult > 1 ? 's' : ''}`);
      if (counts.student) parts.push(`student · ${counts.student}`);
      if (counts.senior)  parts.push(`senior · ${counts.senior}`);
      if (counts.culture) parts.push(`culture · ${counts.culture}`);
      ticketEl.textContent = parts.join(' / ') || '—';
    }
  }
 
  /* ─── Summary 카드 등장 애니메이션 ───────────────────── */
  function initSummaryAnimation() {
    const card    = document.getElementById('summary_card');
    const trigger = document.getElementById('date_section');
    if (!card || !trigger) return;
 
    // GSAP 있으면 GSAP, 없으면 IntersectionObserver fallback
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      gsap.to('#summary_card', {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: '#date_section',
          start: 'top 60%',
          toggleActions: 'play none none reverse',
        },
      });
    } else {
      // IntersectionObserver fallback
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            card.style.transition = 'opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
            obs.disconnect();
          }
        });
      }, { threshold: 0.05 });
      obs.observe(trigger);
    }
  }
 
  /* ─── 햄버거 메뉴 ─────────────────────────────────────── */
  function initMenu() {
    const openBtn  = document.getElementById('menu_btn');
    const closeBtn = document.getElementById('close_btn');
    const overlay  = document.getElementById('menu_overlay');
    if (!overlay) return;
    openBtn  && openBtn.addEventListener('click',  () => { overlay.classList.add('open');    document.body.style.overflow = 'hidden'; });
    closeBtn && closeBtn.addEventListener('click', () => { overlay.classList.remove('open'); document.body.style.overflow = ''; });
    overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; } });
  }
 
  /* ─── 결제 버튼 ──────────────────────────────────────── */
  function initPaymentButton() {
    const btn = document.querySelector('.btn_payment');
    btn && btn.addEventListener('click', () => {
      const total = Object.values(state.counts).reduce((a, b) => a + b, 0);
      if (total === 0) { alert('Please select at least one visitor.'); return; }
      alert(`Proceeding to payment!\n\nDate: ${MONTHS[state.month].slice(0,3)} ${state.selectedDay}, ${state.year}\nTime: ${state.selectedTime}\nVisitors: ${total}`);
    });
  }
 
  /* ─── 배너 무한 루프 ──────────────────────────────────── */
  function initBanner() {
    const track = document.querySelector('.banner_track');
    if (!track) return;
    track.parentElement.appendChild(track.cloneNode(true));
  }
 
  /* ─── 초기화 실행 ─────────────────────────────────────── */
  renderCalendar();
  initCalNav();
  initTimeButtons();
  initCountButtons();
  updateSummary();
  initMenu();
  initPaymentButton();
  initBanner();
  setTimeout(initSummaryAnimation, 150);
 
}); // DOMContentLoaded end