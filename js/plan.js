//dom start 

//아이조아팀 기본 js 규칙
// 카멜표기법 사용 ex)nickName
// 주석으로 어떤 트리거인지 적어주기 ex) 햄버거 메뉴, 스와이퍼 등

document.addEventListener('DOMContentLoaded', () => {
  const plusBtns = document.querySelectorAll('.plus');
const minusBtns = document.querySelectorAll('.minus');
const totalEl = document.getElementById('totalCount');

let total = 0;

plusBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    const numEl = btn.parentElement.querySelector('.num');
    let count = Number(numEl.textContent);
    count++;
    numEl.textContent = count;
    total++;
    updateTotal();
  });
});

minusBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const numEl = btn.parentElement.querySelector('.num');
    let count = Number(numEl.textContent);
    if(count > 0){
      count--;
      numEl.textContent = count;
      total--;
      updateTotal();
    }
  });
});

function updateTotal(){
  totalEl.textContent = total;
}

// 스크롤 따라오다가 내려오기
const summary = document.querySelector('.summary');
const footer = document.querySelector('footer');

window.addEventListener('scroll', () => {
  const summaryRect = summary.getBoundingClientRect();
  const footerRect = footer.getBoundingClientRect();

  if (summaryRect.bottom >= footerRect.top) {
    summary.classList.add('fixed-bottom');
  } else {
    summary.classList.remove('fixed-bottom');
  }
});

const calendarEl = document.getElementById('calendar');

let currentDate = new Date(2026, 2); // 3월 (0부터 시작)

// 요일
const days = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function renderCalendar() {
  calendarEl.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 헤더 텍스트 변경
  document.querySelector('.option_bar .left p').textContent =
    `${monthNames[month]} ${year}`;

  // 요일 출력
  days.forEach(day => {
    const el = document.createElement('div');
    el.textContent = day;
    el.style.opacity = "0.5";
    calendarEl.appendChild(el);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 빈칸
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    calendarEl.appendChild(empty);
  }

  // 날짜 생성
  for (let i = 1; i <= lastDate; i++) {
    const day = document.createElement('div');
    day.textContent = i;

    day.addEventListener('click', () => {
      document.querySelectorAll('.calendar div').forEach(d => d.classList.remove('active'));
      day.classList.add('active');
    });

    calendarEl.appendChild(day);
  }
}

const monthNames = [
  "JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
  "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"
];

// 버튼 연결
const prevBtn = document.querySelector('.fa-angle-up');
const nextBtn = document.querySelector('.fa-angle-down');

prevBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();
});
//dom end