document.addEventListener("DOMContentLoaded", () => {

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

}); //end