//dom start 

//아이조아팀 기본 js 규칙
// 카멜표기법 사용 ex)nickName
// 주석으로 어떤 트리거인지 적어주기 ex) 햄버거 메뉴, 스와이퍼 등

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  gsap.to(".summary", {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".date_time",
      start: "top 60%",  // 👉 여기서 등장
      toggleActions: "play none none reverse"
    }
  });
});
//dom end