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


/* museum map */

(function () {
  const tabs      = document.querySelectorAll('.floor_tab');
  const panels    = document.querySelectorAll('.floor_panel');
  const legends   = document.querySelectorAll('.legend_panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = this.dataset.floor;   // 'b1' | '1f' | '2f' | '3f'

      // 탭 상태 갱신
      tabs.forEach(function (t) {
        t.classList.remove('is_active');
        t.setAttribute('aria-selected', 'false');
      });
      this.classList.add('is_active');
      this.setAttribute('aria-selected', 'true');

      // 도면 패널 전환
      panels.forEach(function (p) {
        p.classList.remove('is_active');
      });
      var activePanel = document.getElementById('floor_' + target);
      if (activePanel) {
        activePanel.classList.add('is_active');
        // 이미지 재애니메이션: src 유지하면서 fade 효과 재실행
        var img = activePanel.querySelector('img');
        if (img) {
          img.style.animation = 'none';
          img.offsetHeight; // reflow 강제
          img.style.animation = '';
        }
      }

      // 공간 리스트 전환
      legends.forEach(function (l) {
        l.classList.remove('is_active');
      });
      var activeLegend = document.querySelector('.legend_panel[data-legend="' + target + '"]');
      if (activeLegend) {
        activeLegend.classList.add('is_active');
      }
    });
  });
})();

}); //end