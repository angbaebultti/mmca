document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ticketMask = document.querySelector(".ticket_mask");
    const ticket = document.querySelector(".ticket");
    const awardsLine = document.querySelector(".awards_line");
    const checkoutSection = document.querySelector(".checkout");  // 섹션 전체

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
        this.classList.add('active');
        setTimeout(() => {
            const confirmed = confirm('Purchase complete! Your ticket has been sent to your email.');
            if (confirmed) {
                window.location.href = 'main.html';
            }
        }, 300);
    });
});