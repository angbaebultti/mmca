document.addEventListener("DOMContentLoaded", () => {


  //plan 섹션
  const tit_list = document.querySelectorAll('.plan .inner .tit');

  tit_list.forEach(function (tit) {
    tit.addEventListener('click', function () {
      const item = tit.parentElement;
      const button = item.querySelector('.plus');
      const container = item.querySelector('.container');
      const icon = button.querySelector('i');
      const is_open = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', String(!is_open));
      container.setAttribute('aria-hidden', String(is_open));

      // 아이콘 토글
      if (is_open) {
        icon.classList.remove('fa-minus');
        icon.classList.add('fa-plus');
      } else {
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-minus');
      }
    });
  });


  //getting섹션
const tab_btns = document.querySelectorAll('.getting .btn_box button');
const panels = document.querySelectorAll('.getting .info_box > div');

// 초기 활성화
document.querySelector('#subway_panel').classList.add('is_active');

tab_btns.forEach(function (btn) {
  btn.addEventListener('click', function () {

    // 버튼 is_active 토글
    tab_btns.forEach(b => b.classList.remove('is_active'));
    btn.classList.add('is_active');

    // 패널 is_active 토글
    const target = btn.dataset.target;
    panels.forEach(function (panel) {
      panel.classList.remove('is_active');
      if (panel.id === target) {
        panel.classList.add('is_active');
      }
    });

  });
});
}); //end