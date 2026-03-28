document.addEventListener('DOMContentLoaded', () => {

  const museumNav = document.querySelector('.museum_nav');
  if (museumNav) {
    museumNav.style.transition = 'none';
    museumNav.style.maxHeight = '0';
    museumNav.style.overflow = 'hidden';
    museumNav.style.opacity = '0';
  }

  const state = {
    year: 2026,
    month: 2,
    selectedDate: null,
    selectedTime: '10:00~18:00',
    counts: { adult: 1, student: 0, senior: 0, culture: 0 },
  };

  const MONTHS = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

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

    for (let m = 0; m < 2; m++) {
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

      if (m === 0) {
        const prev = document.createElement('button');
        prev.className = 'cal_arrow_btn';
        prev.innerHTML = '&#8249;';
        prev.addEventListener('click', () => {
          state.month--;
          if (state.month < 0) { state.month = 11; state.year--; }
          renderCalendar();
        });
        navDiv.appendChild(prev);
      } else {
        const next = document.createElement('button');
        next.className = 'cal_arrow_btn';
        next.innerHTML = '&#8250;';
        next.addEventListener('click', () => {
          state.month++;
          if (state.month > 11) { state.month = 0; state.year++; }
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
      const today = new Date(); today.setHours(0, 0, 0, 0);

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

  // ✅ summary 카드
  function updateSummary() {
    const dateEl = document.getElementById('summary_date');
    const ticketEl = document.getElementById('summary_ticket');

    if (dateEl) {
      dateEl.textContent = state.selectedDate
        ? fmtSummary(state.selectedDate)
        : 'Select a date';
    }

    if (ticketEl) {
      const c = state.counts;
      const parts = [];
      if (c.adult) parts.push(`adult · ${c.adult}`);
      if (c.student) parts.push(`student · ${c.student}`);
      if (c.senior) parts.push(`senior · ${c.senior}`);
      if (c.culture) parts.push(`culture · ${c.culture}`);
      ticketEl.textContent = parts.join(' / ') || '—';
    }
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

  function initPaymentButton() {
    const btn = document.querySelector('.btn_payment');
    if (!btn) return;

    btn.addEventListener('click', () => {

      if (!state.selectedDate) {
        alert('Please select a date first.');
        return;
      }

      const total = Object.values(state.counts).reduce((a, b) => a + b, 0);

      if (total === 0) {
        alert('Please select at least one visitor.');
        return;
      }
      alert(`Proceeding to payment!

Date: ${fmtSummary(state.selectedDate)}
Time: ${state.selectedTime}
Visitors: ${total}`);


      window.location.href = './reserve.html';
    });
  }
  renderCalendar();
  renderSelLabel();
  initCountButtons();
  initTimeBtns();
  updateSummary();
  initPaymentButton();
  setTimeout(initSummaryAnimation, 150);

});