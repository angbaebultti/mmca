document.addEventListener('DOMContentLoaded', () => {

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP or ScrollTrigger not loaded');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ticketMask = document.querySelector(".ticket_mask");
    const ticket     = document.querySelector(".ticket");

    if (!ticketMask || !ticket) return;

    /*
     * ✅ 핵심 전략
     * scaleY 는 요소 자체를 찌그러뜨릴 뿐 overflow:hidden 클리핑과 별개 →
     * 티켓이 마스크 밖으로 삐져나옴.
     *
     * 해결: ticket_mask 에 overflow:hidden 유지하면서
     *       높이(height) 자체를 0 → auto 로 애니메이션.
     *       단, height auto 는 GSAP 에서 직접 트윈 불가 →
     *       maxHeight 트릭 사용.
     */

    // 티켓 실제 높이 측정 (auto 상태에서)
    const ticketH = ticket.scrollHeight + 60; // padding 여유

    // CSS 초기값 덮어쓰기 (scaleY 제거, height로 통일)
    gsap.set(ticketMask, {
        overflow: "hidden",
        height: 0,
        scaleY: 1,              // CSS scaleY(0) 리셋
        transformOrigin: "top center",
    });

    gsap.set(ticket, {
        y: -20,
        transformOrigin: "top center",
    });

    // ── 스크롤 연동: 마스크 열림 ──────────────────
    gsap.to(ticketMask, {
        height: ticketH,
        ease: "none",
        scrollTrigger: {
            trigger: ".awards_line",
            start: "top 65%",
            end:   "top 5%",
            scrub: 1.2,
            // markers: true,
        }
    });

    // ── 스크롤 연동: 티켓 위치 ───────────────────
    gsap.to(ticket, {
        y: 0,
        ease: "none",
        scrollTrigger: {
            trigger: ".awards_line",
            start: "top 60%",
            end:   "top 5%",
            scrub: 1.5,
        }
    });

    // ── 완전히 열린 후 팔랑 1회 ──────────────────
    const flap = gsap.timeline({ paused: true })
        .to(ticket, { rotate:  4, duration: 0.12, ease: "power1.inOut" })
        .to(ticket, { rotate: -3, duration: 0.12, ease: "power1.inOut" })
        .to(ticket, { rotate:  2, duration: 0.10, ease: "power1.inOut" })
        .to(ticket, { rotate: -1, duration: 0.10, ease: "power1.inOut" })
        .to(ticket, { rotate:  0, duration: 0.4,  ease: "elastic.out(1, 0.5)" });

    ScrollTrigger.create({
        trigger: ".awards_line",
        start: "top 5%",
        onEnter:     () => flap.restart(),
        onEnterBack: () => flap.restart(),
    });

});