//dom start 

//아이조아팀 기본 js 규칙
// 카멜표기법 사용 ex)nickName
// 주석으로 어떤 트리거인지 적어주기 ex) 햄버거 메뉴, 스와이퍼 등

document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById("menu_btn");
    const closeBtn = document.getElementById("close_btn");
    const menu = document.getElementById("menu");

    menuBtn.addEventListener("click", () => {
        menu.classList.add("active");
    });

    closeBtn.addEventListener("click", () => {
        menu.classList.remove("active");
    });
});
//dom end