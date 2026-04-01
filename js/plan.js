document.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const museumNav = document.querySelector('.museum_nav');
  if (museumNav) {
    museumNav.style.transition = 'none';
    museumNav.style.maxHeight = '0';
    museumNav.style.overflow = 'hidden';
    museumNav.style.opacity = '0';
  }

  const state = {
    year: today.getFullYear(),
    month: today.getMonth(),
    selectedDate: new Date(today),
    selectedTime: '10:00~18:00',
    counts: { adult: 1, student: 0, senior: 0, culture: 0 },
  };

  const MONTHS = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  function getVisibleMonthCount() {
    return window.matchMedia('(max-width: 480px)').matches ? 1 : 2;
  }

  let visibleMonthCount = getVisibleMonthCount();

  function moveMonth(delta) {
    state.month += delta;

    while (state.month < 0) {
      state.month += 12;
      state.year--;
    }

    while (state.month > 11) {
      state.month -= 12;
      state.year++;
    }
  }

  function sameDay(a, b) {
    return a && b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function fmtSummary(d) {
    const mo = MONTHS[d.getMonth()].slice(0, 3).toLowerCase();
    const day = String(d.getDate()).padStart(2, '0');
    const time = state.selectedTime.split('~')[0];
    return `${mo} ${day} · ${d.getFullYear()} · ${time}`;
  }

  function renderCalendar() {
    const wrap = document.getElementById('cal_two');
    if (!wrap) return;
    wrap.innerHTML = '';

    for (let m = 0; m < visibleMonthCount; m++) {
      let yr = state.year;
      let mo = state.month + m;
      if (mo > 11) { mo -= 12; yr++; }

      const col = document.createElement('div');
      col.className = 'cal_month_col';

      const hdr = document.createElement('div');
      hdr.className = 'cal_mheader';

      const mname = document.createElement('span');
      mname.className = 'cal_mname';
      mname.textContent = `${MONTHS[mo]} ${yr}`;

      const navDiv = document.createElement('div');
      navDiv.className = 'nav_arrows';

      if (visibleMonthCount === 1 || m === 0) {
        const prev = document.createElement('button');
        prev.type = 'button';
        prev.className = 'cal_arrow_btn';
        prev.innerHTML = '&#8249;';
        prev.addEventListener('click', () => {
          moveMonth(-1);
          renderCalendar();
        });
        navDiv.appendChild(prev);
      }

      if (visibleMonthCount === 1 || m === visibleMonthCount - 1) {
        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'cal_arrow_btn';
        next.innerHTML = '&#8250;';
        next.addEventListener('click', () => {
          moveMonth(1);
          renderCalendar();
        });
        navDiv.appendChild(next);
      }

      hdr.appendChild(mname);
      hdr.appendChild(navDiv);
      col.appendChild(hdr);

      const dowRow = document.createElement('div');
      dowRow.className = 'cal_dow_row';
      ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => {
        const s = document.createElement('span');
        s.textContent = d;
        dowRow.appendChild(s);
      });
      col.appendChild(dowRow);

      const grid = document.createElement('div');
      grid.className = 'cal_days_grid';

      const firstDay = new Date(yr, mo, 1).getDay();
      const daysInMonth = new Date(yr, mo + 1, 0).getDate();
      const prevDays = new Date(yr, mo, 0).getDate();
      for (let i = 0; i < firstDay; i++) {
        const el = document.createElement('div');
        el.className = 'cal_day other-month';
        el.textContent = prevDays - firstDay + 1 + i;
        grid.appendChild(el);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(yr, mo, d);
        date.setHours(0, 0, 0, 0);

        const el = document.createElement('div');
        el.className = 'cal_day';
        el.textContent = d;

        if (date < today) {
          el.classList.add('disabled');
        } else {

          if (sameDay(date, today)) el.classList.add('today');

          // ⭐ 단일 선택
          if (sameDay(date, state.selectedDate)) {
            el.classList.add('selected');
          }

          el.addEventListener('click', () => {
            state.selectedDate = date;
            renderCalendar();
            renderSelLabel();
            updateSummary();
          });
        }

        grid.appendChild(el);
      }

      col.appendChild(grid);
      wrap.appendChild(col);
    }
  }

  function renderSelLabel() {
    const el = document.getElementById('sel_label');
    if (!el) return;

    if (!state.selectedDate) {
      el.textContent = 'Please select a date.';
      return;
    }

    const d = state.selectedDate;
    const mo = MONTHS[d.getMonth()].slice(0, 3).toLowerCase();
    const day = String(d.getDate()).padStart(2, '0');

    el.textContent = `${mo} ${day} · ${d.getFullYear()}`;
  }

  // ✅ summary 카드 + 인라인 summary 동기화
  function updateSummary() {
    const dateEl = document.getElementById('summary_date');
    const ticketEl = document.getElementById('summary_ticket');

    // 인라인 summary 요소
    const inlineDateEl = document.getElementById('inline_date');
    const inlineTicketEl = document.getElementById('inline_ticket');

    // 날짜 텍스트
    const dateText = state.selectedDate
      ? fmtSummary(state.selectedDate)
      : 'Select a date';

    if (dateEl) dateEl.textContent = dateText;
    if (inlineDateEl) inlineDateEl.textContent = dateText;

    // 인원 텍스트
    const c = state.counts;
    const parts = [];
    if (c.adult) parts.push(`adult · ${c.adult}`);
    if (c.student) parts.push(`student · ${c.student}`);
    if (c.senior) parts.push(`senior · ${c.senior}`);
    if (c.culture) parts.push(`culture · ${c.culture}`);
    const ticketText = parts.join(' / ') || '—';

    if (ticketEl) ticketEl.textContent = ticketText;
    if (inlineTicketEl) inlineTicketEl.textContent = ticketText;
  }

  function initCountButtons() {
    document.querySelectorAll('.count_btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        const delta = btn.classList.contains('plus') ? 1 : -1;
        const min = target === 'adult' ? 1 : 0;

        state.counts[target] = Math.max(min, state.counts[target] + delta);

        const el = document.getElementById(`${target}_count`);
        if (el) el.textContent = state.counts[target];

        updateSummary();
      });
    });
  }

  function initSummaryAnimation() {
    const card = document.getElementById('summary_card');
    const trigger = document.getElementById('date_section');
    if (!card || !trigger) return;

    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(card,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: trigger,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: true,
        }
      }
    );
  }

  function initTimeBtns() {
    document.querySelectorAll('.time_btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.time_btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedTime = btn.dataset.time;
        updateSummary();
      });
    });
  }

  // 결제 버튼 공통 로직 (데스크톱 summary 카드 + 인라인 summary 둘 다 동작)
  function handlePayment() {
    if (!state.selectedDate) {
      alert('Please select a date first.');
      return;
    }

    const total = Object.values(state.counts).reduce((a, b) => a + b, 0);

    if (total === 0) {
      alert('Please select at least one visitor.');
      return;
    }

    alert(`Proceeding to payment!\n\nDate: ${fmtSummary(state.selectedDate)}\nTime: ${state.selectedTime}\nVisitors: ${total}`);

    window.location.href = './reserve.html';
  }

  function initPaymentButton() {
    // 데스크톱 summary 카드 버튼
    const btn = document.querySelector('.summary_card .btn_payment');
    if (btn) btn.addEventListener('click', handlePayment);

    // 태블릿 인라인 summary 버튼
    const inlineBtn = document.getElementById('inline_payment_btn');
    if (inlineBtn) inlineBtn.addEventListener('click', handlePayment);

    // 하단 fixed 바 버튼 (혹시 활성화할 경우 대비)
    const barBtn = document.querySelector('.plan_payment_bar .btn_payment');
    if (barBtn) barBtn.addEventListener('click', handlePayment);
  }

  function initCalendarResponsive() {
    window.addEventListener('resize', () => {
      const nextVisibleMonthCount = getVisibleMonthCount();
      if (nextVisibleMonthCount === visibleMonthCount) return;

      visibleMonthCount = nextVisibleMonthCount;
      renderCalendar();
    });
  }

  // 커서
  const ring = document.getElementById('cursorRing');
  const dot = document.getElementById('cursorDot');
  let mx = 0, my = 0, rx = window.innerWidth / 2, ry = window.innerHeight / 2;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
  });

  (function lerpRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(lerpRing);
  })();

  // data-cursor="light" → 커서 주황색
document.querySelectorAll('[data-cursor="light"]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.classList.add('orange');
    dot.classList.add('orange');
  });
  el.addEventListener('mouseleave', () => {
    ring.classList.remove('orange');
    dot.classList.remove('orange');
  });
});

  renderCalendar();
  renderSelLabel();
  initCountButtons();
  initTimeBtns();
  updateSummary();
  initPaymentButton();
  initCalendarResponsive();
  setTimeout(initSummaryAnimation, 150);

});
