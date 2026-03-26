document.addEventListener("DOMContentLoaded", () => {

  // plan 섹션
  const tit_list = document.querySelectorAll('.plan .inner .tit');

  tit_list.forEach(function (tit) {
    tit.addEventListener('click', function () {
      const item = tit.parentElement;
      const button = item.querySelector('.plus');
      const container = item.querySelector('.container');
      const is_open = button.getAttribute('aria-expanded') === 'true';

      // 다른 아코디언 전부 닫기
      tit_list.forEach(function (other_tit) {
        const other_item = other_tit.parentElement;
        const other_button = other_item.querySelector('.plus');
        const other_container = other_item.querySelector('.container');

        other_button.setAttribute('aria-expanded', 'false');
        other_container.setAttribute('aria-hidden', 'true');
      });

      // 클릭한 항목 토글
      if (!is_open) {
        button.setAttribute('aria-expanded', 'true');
        container.setAttribute('aria-hidden', 'false');
      }
    });
  });


  // getting 섹션
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