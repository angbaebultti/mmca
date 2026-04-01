document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ticketMask = document.querySelector(".ticket_mask");
    const ticket = document.querySelector(".ticket");
    const awardsLine = document.querySelector(".awards_line");
    const checkoutSection = document.querySelector(".checkout");

    if (!ticketMask || !ticket || !awardsLine) return;
    gsap.set(ticket, {
        y: () => -(ticket.offsetHeight + 50),
        opacity: 0,
        filter: "blur(10px)"
    });

    gsap.to(ticket, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        ease: "none",
        scrollTrigger: {
            trigger: checkoutSection,
            start: "top top",
            end: "top -100%",
            scrub: 1.2,
        }
    });

    const flap = gsap.timeline({ paused: true })
        .to(ticket, { rotate: 3, duration: 0.12, ease: "power1.inOut" })
        .to(ticket, { rotate: -2, duration: 0.12, ease: "power1.inOut" })
        .to(ticket, { rotate: 1, duration: 0.10, ease: "power1.inOut" })
        .to(ticket, { rotate: 0, duration: 0.4, ease: "elastic.out(1, 0.5)" });

    ScrollTrigger.create({
        trigger: checkoutSection,
        start: "top -100%",
        onEnter: () => flap.restart(),
        onEnterBack: () => flap.restart(),
    });



    document.querySelector('.purchase_btn').addEventListener('click', function () {
        const agreeCheckbox = document.querySelector('.agree input[type="checkbox"]');

        // 동의 체크 안 됐으면 경고
        if (!agreeCheckbox.checked) {
            const wrap = document.querySelector('.agree_error_wrap');
            wrap.textContent = "Please agree to the Terms of Service before completing your purchase.";
            wrap.classList.add('agree_error');
            setTimeout(() => {
                wrap.textContent = "";
                wrap.classList.remove('agree_error');
            }, 3000);
            return;
        }

        this.classList.add('active');
        setTimeout(() => {
            const confirmed = confirm('Purchase complete! Your ticket has been sent to your email.');
            if (confirmed) {
                window.location.href = 'main.html';
            }
        }, 300);
    });
    // FULL NAME 유효성
    const nameInput = document.querySelectorAll(".form_group input[type='text']")[0];

    if (nameInput) {
        nameInput.addEventListener("blur", () => {
            if (nameInput.value.trim().length > 0) {
                nameInput.style.borderBottomColor = "#07a514";
            } else {
                nameInput.style.borderBottomColor = "";
            }
        });

        nameInput.addEventListener("input", () => {
            nameInput.style.borderBottomColor = "";
        });
    }

    // USER VERIFICATION 입력 제한 (6자리)
    const verifyInput = document.querySelectorAll(".form_group input[type='text']")[2];
    const sendCodeCheckbox = document.getElementById("send_code_btn");

    // Send Code 체크 전엔 비활성화
    verifyInput.disabled = true;
    verifyInput.style.opacity = "0.3";
    verifyInput.style.cursor = "not-allowed";

    sendCodeCheckbox.addEventListener("change", () => {
        if (sendCodeCheckbox.checked) {
            verifyInput.disabled = false;
            verifyInput.style.opacity = "1";
            verifyInput.style.cursor = "text";
        } else {
            verifyInput.disabled = true;
            verifyInput.style.opacity = "0.3";
            verifyInput.style.cursor = "not-allowed";
            verifyInput.value = "";
            verifyInput.style.borderBottomColor = "";
            const existing = verifyInput.parentElement.querySelector(".verify_error");
            if (existing) existing.remove();
        }
    });

    if (verifyInput) {
        // 6자리 초과 막기 + 6자리 완성 감지 (통합)
        verifyInput.addEventListener("input", () => {
            if (verifyInput.value.length > 6) {
                verifyInput.value = verifyInput.value.slice(0, 6);
            }
            if (verifyInput.value.length === 6) {
                verifyInput.style.borderBottomColor = "#07a514";
                const existing = verifyInput.parentElement.querySelector(".verify_error");
                if (existing) existing.remove();
            }
        });

        // 숫자만 입력되게 + 문자 입력 시 경고
        verifyInput.addEventListener("keypress", (e) => {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
                const existing = verifyInput.parentElement.querySelector(".verify_error");
                if (!existing) {
                    const err = document.createElement("span");
                    err.className = "verify_error";
                    err.textContent = "Numbers only — please enter digits 0–9.";
                    verifyInput.insertAdjacentElement("afterend", err);
                    setTimeout(() => err.remove(), 1500);
                }
            }
        });

        verifyInput.addEventListener("blur", () => {
            const len = verifyInput.value.length;
            if (len > 0 && len < 6) {
                verifyInput.style.borderBottomColor = "#FF6624";
                const existing = verifyInput.parentElement.querySelector(".verify_error");
                if (!existing) {
                    const err = document.createElement("span");
                    err.className = "verify_error";
                    err.textContent = `${len}/6 digits entered — please complete the verification code.`;
                    verifyInput.insertAdjacentElement("afterend", err);
                }
            } else if (len === 6) {
                verifyInput.style.borderBottomColor = "#07a514";
            } else {
                verifyInput.style.borderBottomColor = "";
                const existing = verifyInput.parentElement.querySelector(".verify_error");
                if (existing) existing.remove();
            }
        });
    }

    // EMAIL ADDRESS 유효성 검사
    const emailInput = document.querySelectorAll(".form_group input[type='text']")[1];

    if (emailInput) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        emailInput.addEventListener("blur", () => {
            const val = emailInput.value.trim();
            const existing = emailInput.closest(".form_group").querySelector(".email_error");
            const helper = emailInput.closest(".form_group").querySelector(".helper");

            if (val.length > 0 && !emailRegex.test(val)) {
                emailInput.style.borderBottomColor = "#FF6624";
                if (helper) helper.style.color = "";
                if (!existing) {
                    const err = document.createElement("span");
                    err.className = "email_error";
                    err.textContent = "Please enter a valid email address.";
                    emailInput.insertAdjacentElement("afterend", err);
                }
            } else if (val.length > 0 && emailRegex.test(val)) {
                emailInput.style.borderBottomColor = "#07a514";
                if (existing) existing.remove();
                if (helper) {
                    helper.textContent = "✔ Email confirmed — verification code will be sent.";
                    helper.style.color = "#07a514";
                }
            } else {
                emailInput.style.borderBottomColor = "";
                if (existing) existing.remove();
                if (helper) {
                    helper.textContent = "We will send a 6-digit verification code";
                    helper.style.color = "";
                }
            }
        });

        emailInput.addEventListener("input", () => {
            const existing = emailInput.closest(".form_group").querySelector(".email_error");
            const helper = emailInput.closest(".form_group").querySelector(".helper");
            if (existing) existing.remove();
            emailInput.style.borderBottomColor = "";
            if (helper) {
                helper.textContent = "We will send a 6-digit verification code";
                helper.style.color = "";
            }
        });
    }

    // CARD NUMBER - 16자리 숫자, 자동 스페이스
    const cardInput = document.querySelectorAll(".card_box .form_group input[type='text']")[0];

    if (cardInput) {
        cardInput.addEventListener("input", () => {
            let val = cardInput.value.replace(/\D/g, "").slice(0, 16);
            cardInput.value = val.replace(/(.{4})/g, "$1 ").trim();
        });

        cardInput.addEventListener("blur", () => {
            const raw = cardInput.value.replace(/\s/g, "");
            const existing = cardInput.parentElement.querySelector(".card_error");
            if (raw.length > 0 && raw.length < 16) {
                cardInput.style.borderBottomColor = "#FF6624";
                if (!existing) {
                    const err = document.createElement("span");
                    err.className = "card_error";
                    err.textContent = `${raw.length}/16 digits — please enter a valid card number.`;
                    cardInput.insertAdjacentElement("afterend", err);
                }
            } else if (raw.length === 16) {
                cardInput.style.borderBottomColor = "#07a514";
                if (existing) existing.remove();
            } else {
                cardInput.style.borderBottomColor = "";
                if (existing) existing.remove();
            }
        });

        cardInput.addEventListener("input", () => {
            const existing = cardInput.parentElement.querySelector(".card_error");
            if (existing) existing.remove();
            if (cardInput.value.replace(/\s/g, "").length < 16) {
                cardInput.style.borderBottomColor = "";
            }
        });
    }

    // EXPIRY DATE - MM/YY 형식
    const expiryInput = document.querySelectorAll(".row .form_group input[type='text']")[0];

    if (expiryInput) {
        expiryInput.addEventListener("input", () => {
            let val = expiryInput.value.replace(/\D/g, "").slice(0, 4);
            if (val.length >= 3) val = val.slice(0, 2) + "/" + val.slice(2);
            expiryInput.value = val;
        });

        expiryInput.addEventListener("blur", () => {
            const val = expiryInput.value;
            const existing = expiryInput.parentElement.querySelector(".expiry_error");
            const valid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(val);
            if (val.length > 0 && !valid) {
                expiryInput.style.borderBottomColor = "#FF6624";
                if (!existing) {
                    const err = document.createElement("span");
                    err.className = "expiry_error";
                    err.textContent = "Please enter a valid expiry date (MM/YY).";
                    expiryInput.insertAdjacentElement("afterend", err);
                }
            } else if (valid) {
                expiryInput.style.borderBottomColor = "#07a514";
                if (existing) existing.remove();
            } else {
                expiryInput.style.borderBottomColor = "";
                if (existing) existing.remove();
            }
        });

        expiryInput.addEventListener("input", () => {
            const existing = expiryInput.parentElement.querySelector(".expiry_error");
            if (existing) existing.remove();
            expiryInput.style.borderBottomColor = "";
        });
    }

    // CVC - 3자리
    const cvcInput = document.querySelectorAll(".row .form_group input[type='text']")[1];

    if (cvcInput) {
        cvcInput.addEventListener("input", () => {
            cvcInput.value = cvcInput.value.replace(/\D/g, "").slice(0, 3);
        });

        cvcInput.addEventListener("blur", () => {
            const val = cvcInput.value;
            const existing = cvcInput.parentElement.querySelector(".cvc_error");
            if (val.length > 0 && val.length < 3) {
                cvcInput.style.borderBottomColor = "#FF6624";
                if (!existing) {
                    const err = document.createElement("span");
                    err.className = "cvc_error";
                    err.textContent = "CVC must be 3 digits.";
                    cvcInput.insertAdjacentElement("afterend", err);
                }
            } else if (val.length === 3) {
                cvcInput.style.borderBottomColor = "#07a514";
                if (existing) existing.remove();
            } else {
                cvcInput.style.borderBottomColor = "";
                if (existing) existing.remove();
            }
        });

        cvcInput.addEventListener("input", () => {
            const existing = cvcInput.parentElement.querySelector(".cvc_error");
            if (existing) existing.remove();
            cvcInput.style.borderBottomColor = "";
        });
    }

    // 커서
    const ring = document.getElementById('cursorRing');
    const dot = document.getElementById('cursorDot');
    let mx = 0, my = 0, rx = window.innerWidth / 2, ry = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
    });

    (function lerpRing() {
        rx += (mx - rx) * 0.1;
        ry += (my - ry) * 0.1;
        if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
        requestAnimationFrame(lerpRing);
    })();

    // data-cursor="light" → 커서 주황색
    document.querySelectorAll('[data-cursor="light"]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.classList.add('orange');
            dot.classList.add('orange');
        });
        el.addEventListener('mouseleave', () => {
            ring.classList.remove('orange');
            dot.classList.remove('orange');
        });
    });

    const savedEmail = sessionStorage.getItem("userEmail");
    const savedName = sessionStorage.getItem("userName");

    if (savedEmail) {
        const step1 = document.querySelector(".step:first-of-type");

        const banner = document.createElement("div");
        banner.className = "autofill_banner";
        banner.innerHTML = `
          <p><span>✔</span> Signed in as <strong>${savedEmail}</strong> — fill in your details instantly.</p>
          <button type="button" class="autofill_btn">Autofill My Info</button>
        `;
        step1.insertAdjacentElement("beforebegin", banner);

        document.querySelector(".autofill_btn").addEventListener("click", () => {
            const inputs = document.querySelectorAll(".form_group input[type='text']");
            inputs[0].value = savedName;
            inputs[1].value = savedEmail;
        });

    } else {
        const step1 = document.querySelector(".step:first-of-type");
        const noticeBanner = document.createElement("div");
        noticeBanner.className = "autofill_banner notice_banner";
        noticeBanner.innerHTML = `
          <p>💡 <strong>Members</strong> can autofill their details in one click — 
          <a href="signin.html">Sign in</a> or <a href="#">Create an account</a> 
          for a faster checkout experience.</p>
        `;
        step1.insertAdjacentElement("beforebegin", noticeBanner);
    }
});