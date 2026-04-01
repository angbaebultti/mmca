document.addEventListener("DOMContentLoaded", () => {

  // 커서 생성 조건: login_page 여부 무관하게 생성
  if (window.innerWidth > 480 && !document.querySelector(".cursor-dot")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="cursor-ring" id="cursorRing"></div>
       <div class="cursor-dot" id="cursorDot"></div>`
    );

    const ring = document.getElementById("cursorRing");
    const dot = document.getElementById("cursorDot");

    let mx = 0, my = 0;
    let rx = window.innerWidth / 2;
    let ry = window.innerHeight / 2;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";

      // login_page가 있을 때: input/form 영역에서는 커서 숨김
      const loginPage = document.querySelector(".login_page");
      if (loginPage) {
        const formArea = document.querySelector(".login_form, .login_input_wrap, .login_option");
        const overForm = e.target.closest(".login_form, .login_input_wrap, input, .keep_login, .login_find, .login_btn");
        const overSns = e.target.closest(".sns_btn, .login_logo, .login_bottom");

        if (overForm && !overSns) {
          ring.style.opacity = "0";
          dot.style.opacity = "0";
        } else {
          ring.style.opacity = "1";
          dot.style.opacity = "1";
        }
      }
    });

    function animateCursor() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.addEventListener("mousedown", () => {
      ring.style.transform = "translate(-50%, -50%) scale(0.8)";
    });
    document.addEventListener("mouseup", () => {
      ring.style.transform = "translate(-50%, -50%) scale(1)";
    });
  }

  // 로그인 로직 (기존과 동일)
  const DUMMY_ACCOUNTS = [
    { email: "test@mmca.com", password: "1234" },
    { email: "admin@mmca.com", password: "admin123" }
  ];

  function handleLogin() {
    const email = document.querySelector("input[type='text']").value;
    const password = document.querySelector("input[type='password']").value;

    const matched = DUMMY_ACCOUNTS.find(
      (acc) => acc.email === email && acc.password === password
    );

    if (matched) {
      location.href = "main.html";
    } else {
      const errorMsg = document.querySelector(".error_msg");
      errorMsg.textContent = "Invalid email or password. Please try again.";
      errorMsg.style.display = "block";
    }
  }

  // 더미 계정 자동입력 버튼 생성
  const dummyBtn = document.createElement("button");
  dummyBtn.type = "button";
  dummyBtn.className = "dummy_fill_btn";
  dummyBtn.textContent = "Use Test Account";

  let isFilled = false; // ← 토글 상태 추적

  dummyBtn.addEventListener("click", () => {
    const emailInput = document.querySelector("input[type='text']");
    const passwordInput = document.querySelector("input[type='password']");

    if (!isFilled) {
      emailInput.value = "test@mmca.com";
      passwordInput.value = "1234";
      dummyBtn.textContent = "Clear Test Account"; // ← 텍스트도 바뀌면 더 직관적
      isFilled = true;
    } else {
      emailInput.value = "";
      passwordInput.value = "";
      dummyBtn.textContent = "Use Test Account";
      isFilled = false;
    }
  });
  // .login_btn 바로 앞에 삽입
  const loginBtn = document.querySelector(".login_btn");
  loginBtn.parentNode.insertBefore(dummyBtn, loginBtn);

  document.querySelector(".login_btn").addEventListener("click", handleLogin);

  document.querySelectorAll("input[type='text'], input[type='password']").forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleLogin();
    });
  });

  document.querySelectorAll(".sns_btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      alert("This feature is currently under preparation.");
    });
  });
});