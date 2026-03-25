//dom start 

//아이조아팀 기본 js 규칙
// 카멜표기법 사용 ex)nickName
// 주석으로 어떤 트리거인지 적어주기 ex) 햄버거 메뉴, 스와이퍼 등

document.addEventListener('DOMContentLoaded', () => {

    //햄버거 메뉴
    const menuBtn = document.getElementById("menu_btn");
    const closeBtn = document.getElementById("close_btn");
    const menu = document.getElementById("menu");

    menuBtn.addEventListener("click", () => {
        menu.classList.add("active");
    });

    closeBtn.addEventListener("click", () => {
        menu.classList.remove("active");
    });


    // top 버튼 부드럽게 
    const top_btn = document.querySelector('.top_btn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            top_btn.classList.add('active');
        } else {
            top_btn.classList.remove('active');
        }
    });

    //header 쉬링크
    const header = document.querySelector(".header");

    window.addEventListener("scroll", function(){

      if(window.scrollY > 500){
    header.classList.add("shrink");
      }else{
    header.classList.remove("shrink");
      }
});



});
//dom end