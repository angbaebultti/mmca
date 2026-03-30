document.addEventListener("DOMContentLoaded", () => {
  const tabletMedia = window.matchMedia("(max-width: 1024px)");
  /* =============================================
     1번+6번: 가로 스크롤
  ============================================= */
  (function initHorizontalScroll() {
    const wrapper = document.getElementById("artist_section");
    if (!wrapper) return;

    const TOTAL_SLIDES = 4;
    const horizontalAnimationEnd = 0.82;
    let currentIndex = 0;
    let renderedIndex = 0;
    let isAnimating = false;
    let contentSwapTimerId = null;

    const slides = [
      {
        photo: "img/Yuna Park_01.jpg",
        name: "Yuna Park",
        desc: "Yuna Park explores sound and listening as social and cultural constructs shaped through time. Her recent works focus on how listening practices emerge within specific contexts, how auditory perception evolves, and how sound can function as a medium for alternative narratives, collective memory, and new forms of knowledge.",
        artworks: [
          "img/yuna_1.png",
          "img/yuna_2.png",
          "img/yuna_3.png",
          "img/yuna_4.png",
        ],
      },
      {
        photo: "img/Seo Rin_02.jpg",
        name: "Seo Rin",
        desc: "Seo Rin reinterprets visual traditions inspired by East Asian aesthetics to reflect on identity, the human body, and the relationship between nature and society. The artist reconstructs traditional formats such as panels and scroll-based compositions into contemporary expressions, while uncovering overlooked perspectives and imaginative possibilities.",
        artworks: [
          "img/rin_1.png",
          "img/rin_2.png",
          "img/rin_3.png",
          "img/rin_4.png",
        ],
      },
      {
        photo: "img/Null Frame Collective_03.jpg",
        name: "Null Frame Collective",
        desc: "Null Frame Collective investigates how machines perceive and reconstruct reality. By combining datasets, computer vision, and generative systems, the group creates works that expose the hidden logic of algorithms. Their projects often reinterpret technological processes with irony and narrative, questioning how digital systems reshape memory and history.",
        artworks: [
          "img/null_1.png",
          "img/null_2.png",
          "img/null_3.png",
          "img/null_4.png",
        ],
      },
      {
        photo: "img/Jin Ah Lim_04.jpg",
        name: "Jin Ah Lim",
        desc: "Jin Ah Lim explores belief systems and cultural narratives through video, installation, and interactive media. By placing scientific perspectives alongside myth and superstition, the artist reveals their coexistence in contemporary life. Her works unfold as narrative environments that blur the boundaries between reality, imagination, and speculative futures.",
        artworks: [
          "img/gina_1.png",
          "img/gina_2.png",
          "img/gina_3.png",
          "img/gina_4.png",
        ],
      },
    ];

    const scrollBtn = document.getElementById("section05");
    const slideLayout = wrapper.querySelector(".slide_layout");

    const photoEl = document.getElementById("slidePhoto");
    const nameEl = document.getElementById("slideName");
    const descEl = document.getElementById("slideDesc");
    const artworksEl = document.getElementById("slideArtworks");
    const artworkEffectTimers = [];
    let isPointerDragging = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    // slide_dots 안의 dot 선택 (slide_dots_wrap 또는 slide_dots 모두 대응)
    const dots = document.querySelectorAll(
      ".slide_dots .dot, .slide_dots_wrap .dot",
    );

    function ensureArtworkCards() {
      const directImages = Array.from(artworksEl.children).filter(
        (child) => child.tagName === "IMG",
      );

      directImages.forEach((img) => {
        const card = document.createElement("div");
        card.className = "artwork_card";
        artworksEl.insertBefore(card, img);
        card.appendChild(img);
      });
    }

    function runArtworkGlassEffect() {
      artworkEffectTimers.forEach((timerId) => clearTimeout(timerId));
      artworkEffectTimers.length = 0;

      const cards = artworksEl.querySelectorAll(".artwork_card");
      cards.forEach((card, index) => {
        card.classList.remove("glass-flow");

        const timerId = window.setTimeout(() => {
          card.classList.add("glass-flow");
          const cleanupId = window.setTimeout(() => {
            card.classList.remove("glass-flow");
          }, 1180);
          artworkEffectTimers.push(cleanupId);
        }, index * 110);

        artworkEffectTimers.push(timerId);
      });
    }

    ensureArtworkCards();

    function updateContent(index, { immediate = false } = {}) {
      if (contentSwapTimerId) {
        window.clearTimeout(contentSwapTimerId);
        contentSwapTimerId = null;
      }

      if (!immediate && renderedIndex === index && !isAnimating) return;

      currentIndex = index;
      isAnimating = true;
      const s = slides[index];

      // 페이드 아웃
      photoEl.style.opacity = "0";
      artworksEl.style.opacity = "0";
      nameEl.style.opacity = "0";
      descEl.style.opacity = "0";

      const commitContent = () => {
        photoEl.src = s.photo;
        nameEl.textContent = s.name;
        descEl.textContent = s.desc;
        const cards = artworksEl.querySelectorAll(".artwork_card");
        cards.forEach((card, i) => {
          const baseImg = card.querySelector("img");
          if (baseImg) baseImg.src = s.artworks[i];
        });

        // 페이드 인
        photoEl.style.opacity = "1";
        artworksEl.style.opacity = "1";
        nameEl.style.opacity = "1";
        descEl.style.opacity = "1";
        runArtworkGlassEffect();

        renderedIndex = index;
        isAnimating = false;
        contentSwapTimerId = null;
      };

      if (immediate) {
        commitContent();
      } else {
        contentSwapTimerId = window.setTimeout(commitContent, 50);
      }

      // dots 업데이트
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    }

    function getScrollProgress() {
      const wrapperTop = wrapper.getBoundingClientRect().top;
      const scrolled = -wrapperTop;
      const scrollableH = wrapper.offsetHeight - window.innerHeight;
      return Math.min(Math.max(scrolled / scrollableH, 0), 1);
    }

    function applySlide(progress, rawProgress = progress) {
      // 가로 슬라이드: 각 슬라이드 구간을 동일한 폭으로 나눠 전환 시점을 고르게 맞춥니다.
      const newIndex = Math.min(
        Math.floor(progress * TOTAL_SLIDES),
        TOTAL_SLIDES - 1,
      );
      if (newIndex !== currentIndex || renderedIndex !== newIndex) {
        updateContent(newIndex, { immediate: progress === 0 });
      }
      if (scrollBtn) {
        // 스크롤 안내는 애니메이션이 끝나도 섹션이 끝날 때까지 유지합니다.
        scrollBtn.style.opacity =
          rawProgress > 0 && rawProgress < 1 ? "1" : "0";
      }
    }

    function goToSlide(index, { immediate = true } = {}) {
      const clampedIndex = Math.min(Math.max(index, 0), TOTAL_SLIDES - 1);
      if (clampedIndex === renderedIndex && clampedIndex === currentIndex)
        return;
      updateContent(clampedIndex, { immediate });
    }

    window.addEventListener(
      "scroll",
      () => {
        if (tabletMedia.matches) return;
        const rawProgress = getScrollProgress();

        // 가로 스크롤 섹션: 마지막 구간은 여유 스크롤로 남기고 애니메이션은 먼저 끝냅니다.
        const animationProgress = Math.min(
          rawProgress / horizontalAnimationEnd,
          1,
        );

        applySlide(animationProgress, rawProgress);
      },
      { passive: true },
    );

    updateContent(0, { immediate: true });

    if (slideLayout) {
      slideLayout.addEventListener("pointerdown", (e) => {
        if (!tabletMedia.matches) return;

        isPointerDragging = true;
        pointerStartX = e.clientX;
        pointerStartY = e.clientY;
        slideLayout.setPointerCapture(e.pointerId);
      });

      const handlePointerEnd = (e) => {
        if (!tabletMedia.matches || !isPointerDragging) return;

        const deltaX = e.clientX - pointerStartX;
        const deltaY = e.clientY - pointerStartY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        const horizontalThreshold = 42;

        isPointerDragging = false;

        if (absX < horizontalThreshold || absX <= absY) return;

        if (deltaX < 0) {
          if (renderedIndex < TOTAL_SLIDES - 1) {
            goToSlide(renderedIndex + 1, { immediate: false }); // immediate: false 로 변경
            return;
          }

          const historyEl = document.getElementById("history_skip");
          if (historyEl) {
            historyEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          return;
        }

        if (renderedIndex > 0) {
          goToSlide(renderedIndex - 1, { immediate: false }); // immediate: false 로 변경
        }
      };

      slideLayout.addEventListener("pointerup", handlePointerEnd);
      slideLayout.addEventListener("pointercancel", () => {
        isPointerDragging = false;
      });
    }

    document.querySelectorAll(".skip_btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const historyEl = document.getElementById("history_skip");
        if (historyEl) historyEl.scrollIntoView({ behavior: "smooth" });
      });
    });
  })();

  /* 배경 물결선 Canvas */
  (function initWave() {
    const canvas = document.getElementById("waveCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width, height, animId;
    let offset = 0;

    function resize() {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const amplitude = 40; // 진폭 (출렁임 크기)
      const frequency = 0.004; // 주파수 (물결 촘촘함)
      const speed = 0.005; // 흐르는 속도

      // 물결선 한 줄을 그리는 함수
      function drawWaveLine({
        strokeStyle,
        phaseOffset,
        verticalOffset = 0,
        angleDeg = 0,
        amplitude: amp,
        frequency: freq,
      }) {
        const cx = width / 2;
        const cy = height / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((angleDeg * Math.PI) / 190);
        ctx.translate(-cx, -cy);

        ctx.beginPath();
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 1.5;

        for (let x = -width; x <= width * 2; x++) {
          const y =
            cy +
            Math.sin(x * freq + offset + phaseOffset) * amp +
            verticalOffset;
          x === -width ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        ctx.stroke();
        ctx.restore();
      }

      // 흰색 선 (우하향)
      drawWaveLine({
        strokeStyle: "rgba(255, 255, 255, 0.12)",
        phaseOffset: 0,
        angleDeg: 8,
        amplitude: 60, // 출렁임 크기 조절
        frequency: 0.004, // 물결 촘촘함 조절
        verticalOffset: -80, // 위로 올리기 (음수=위, 양수=아래)
      });

      // 오렌지 선 (우상향, 흰색과 X자 교차)
      drawWaveLine({
        strokeStyle: "rgba(255, 102, 36, 0.12)",
        phaseOffset: Math.PI,
        angleDeg: 8,
        amplitude: -60, // 출렁임 크기 조절
        frequency: 0.004, // 물결 촘촘함 조절
        verticalOffset: 180, // 아래로 내리기
      });

      offset += speed;
      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", () => {
      resize();
    });
  })();

  /* =============================================
     2번: History 슬라이더 레버
  ============================================= */
  (function initHistorySlider() {
    const historyWrapper = document.getElementById("historyWrapper");
    const track = document.getElementById("historyTrack");
    const trackWrap = document.getElementById("sliderTrackWrap");
    const thumb = document.getElementById("sliderThumb");
    const fill = document.getElementById("sliderFill");
    const sliderViewport = track?.closest(".history_slider_wrap");
    if (!track || !trackWrap || !thumb) return;

    const posters = track.querySelectorAll(".poster_item");
    const TOTAL_POSTERS = posters.length;
    const MIN_PERCENT = 1 / (TOTAL_POSTERS + 1);
    const historyAnimationEnd = 0.84;
    let isDragging = false;
    let currentPercent = MIN_PERCENT;
    let tabletSyncFrame = 0;
    let tabletDragScrollLeft = 0;

    function updateSliderUi(percent) {
      currentPercent = Math.min(Math.max(percent, MIN_PERCENT), 1);
      const trackW = trackWrap.offsetWidth;
      const thumbRadius = thumb.offsetWidth / 2;
      const thumbX = currentPercent * trackW - thumbRadius;
      thumb.style.transform = `translate3d(${thumbX}px, -50%, 0)`;
      if (fill) fill.style.transform = `scaleX(${currentPercent})`;
    }

    function getTabletScrollMax() {
      if (!sliderViewport) return 0;
      return Math.max(
        sliderViewport.scrollWidth - sliderViewport.clientWidth,
        0,
      );
    }

    function syncFromTabletScroll() {
      if (!tabletMedia.matches || !sliderViewport) return;
      if (tabletSyncFrame) return;

      tabletSyncFrame = window.requestAnimationFrame(() => {
        tabletSyncFrame = 0;
        const maxScroll = getTabletScrollMax();
        const normalized =
          maxScroll > 0 ? sliderViewport.scrollLeft / maxScroll : 0;
        updateSliderUi(MIN_PERCENT + normalized * (1 - MIN_PERCENT));
        track.style.transform = "translateX(0)";
      });
    }

    function applyPosition(percent) {
      if (tabletMedia.matches) {
        updateSliderUi(percent);
        const normalized = (currentPercent - MIN_PERCENT) / (1 - MIN_PERCENT);
        const maxScroll = getTabletScrollMax();
        tabletDragScrollLeft = normalized * maxScroll;
        if (sliderViewport && !isDragging) {
          sliderViewport.scrollLeft = tabletDragScrollLeft;
        }
        track.style.transform = isDragging
          ? `translateX(-${tabletDragScrollLeft}px)`
          : "translateX(0)";
        return;
      }
      currentPercent = Math.min(Math.max(percent, MIN_PERCENT), 1);

      // 레버 위치
      const trackW = trackWrap.offsetWidth;
      const thumbRadius = thumb.offsetWidth / 2;
      const thumbX = currentPercent * trackW - thumbRadius;
      thumb.style.transform = `translate3d(${thumbX}px, -50%, 0)`;

      // 2번 History - 레버 지나간 자리 포인트컬러 채움
      if (fill) fill.style.transform = `scaleX(${currentPercent})`;

      // 트랙 이동: MIN_PERCENT → 0(2025보임), 1 → 최대(2012보임)
      const normalized = (currentPercent - MIN_PERCENT) / (1 - MIN_PERCENT);

      const posterW = posters[0].offsetWidth + 20;
      const totalW = TOTAL_POSTERS * posterW;
      const section = track.closest(".history_section");
      const style = getComputedStyle(section);
      const visibleW =
        section.offsetWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      const maxOffset = Math.max(0, totalW - visibleW);
      track.style.transform = `translateX(-${normalized * maxOffset}px)`;
    }

    function syncWindowScrollFromPercent(percent) {
      const normalized =
        (Math.min(Math.max(percent, MIN_PERCENT), 1) - MIN_PERCENT) /
        (1 - MIN_PERCENT);
      const historyWrapper = document.getElementById("historyWrapper");
      if (!historyWrapper) return;

      const scrollableH =
        historyWrapper.getBoundingClientRect().height - window.innerHeight;
      const targetScroll =
        historyWrapper.offsetTop +
        normalized * (scrollableH * historyAnimationEnd);

      window.scrollTo({ top: targetScroll, behavior: "auto" });
    }

    function handleMove(clientX) {
      const rect = trackWrap.getBoundingClientRect();
      const percent = (clientX - rect.left) / rect.width;
      applyPosition(percent);
    }

    // 교체 - thumb에 캡처 걸어서 밖으로 나가도 드래그 유지
    trackWrap.addEventListener("pointerdown", (e) => {
      isDragging = true;
      track.style.transition = "none";
      trackWrap.setPointerCapture(e.pointerId);
      handleMove(e.clientX);
    });

    // pointermove를 thumb에 걸어야 캡처된 포인터 이벤트를 받음
    trackWrap.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    });

    trackWrap.addEventListener("pointerup", () => {
      isDragging = false;
      track.style.transition = "";
      if (tabletMedia.matches && sliderViewport) {
        sliderViewport.scrollLeft = tabletDragScrollLeft;
        track.style.transform = "translateX(0)";
        return;
      }
      syncWindowScrollFromPercent(currentPercent);
    });
    trackWrap.addEventListener("lostpointercapture", () => {
      isDragging = false;
      track.style.transition = "";
      if (tabletMedia.matches && sliderViewport) {
        sliderViewport.scrollLeft = tabletDragScrollLeft;
        track.style.transform = "translateX(0)";
        return;
      }
      syncWindowScrollFromPercent(currentPercent);
    });

    sliderViewport?.addEventListener(
      "scroll",
      () => {
        if (isDragging) return;
        syncFromTabletScroll();
      },
      { passive: true },
    );

    const modalData = {
      2025: {
        title: "Beyond the Lines and Into New Grounds",
        author: "Minji Lee",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize is a contemporary art initiative established through a collaboration between a national museum and a cultural foundation, dedicated to supporting artists in developing and presenting new work. Each year, four artists or collectives are invited to expand their practices through newly commissioned projects within an exhibition context. Over time, the format has evolved to allow audiences to encounter not only newly produced works but also selected earlier pieces, offering a broader and more layered understanding of each artist's trajectory.</p><p>Rather than functioning as four independent presentations, the exhibition creates a shared environment in which different artistic approaches intersect. This format encourages viewers to consider how distinct practices coexist, influence one another, and generate new readings when placed in proximity. At the same time, the structure of recognition within the program raises ongoing questions about how artistic value is perceived, measured, and communicated in a collective exhibition setting.</p><p>If one shifts focus away from institutional frameworks, what comes into view are the four participating artists themselves: Yuna Park, Seo Rin, Null Frame Collective, and Jin Ah Lim. Each develops a unique artistic language while engaging with broader questions that extend beyond individual concerns. The exhibition becomes a space where these perspectives are brought into close dialogue, allowing their differences and affinities to emerge simultaneously.</p><p>Korea Artist Prize 2025 does not aim to unify the artists under a single theme. Instead, it emphasizes shared attitudes—such as inquiry, experimentation, and responsiveness—while acknowledging the distinct directions each artist pursues. The exhibition is structured as a deliberate constellation rather than a loose grouping, proposing relationships that may unfold through encounters, tensions, and unexpected connections.</p><p>As a conceptual framework, the exhibition draws inspiration from a traditional Korean playground activity in which participants define their own areas through simple gestures and movements. This act of marking space can be understood as both a personal and relational process—one that involves negotiation, overlap, and transformation. Within this context, the notion of "ground" extends beyond physical territory, becoming a metaphor for individual perspective and lived experience.</p><p>While elements of competition inevitably arise in any shared structure, this exhibition reconsiders competition not as opposition, but as a form of interaction. The focus shifts from occupying space to engaging with others—touching, crossing, and redefining boundaries. Through this lens, the exhibition proposes a dynamic field in which multiple trajectories coexist, intersect, and evolve.</p><p>The numerical sequence often associated with participation can be reinterpreted here as a set of coordinates—markers that guide movement through the exhibition space. These positions are not fixed hierarchies, but points of departure for exploration. As visitors navigate the exhibition, they encounter the traces of each artist's inquiry, shaped by different methods, sensibilities, and intentions.</p><p>What kinds of lines might emerge from the gestures of Yuna Park, Seo Rin, Null Frame Collective, and Jin Ah Lim? Each approaches the edge of perception from a different standpoint, seeking what lies beyond immediate visibility. Their works invite viewers to move across boundaries, to pause within them, and to reconsider how meaning is formed through these acts of passage.</p><p>In this sense, the exhibition unfolds as an open field—one shaped not only by the artists' practices, but also by the movements, interpretations, and experiences of those who enter it.</p>`,
      },
      2024: {
        title: "Expanding Horizons and Fragmented Worlds",
        author: "Jisoo Kang",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize is a contemporary art initiative dedicated to supporting artists in developing new work within an evolving exhibition framework. Each year, four artists or collectives are invited to expand their practices through newly commissioned projects, while selected earlier works are presented alongside them to offer a more layered understanding of artistic trajectories. Rather than functioning as four independent presentations, the exhibition constructs a shared environment in which diverse artistic approaches intersect, encouraging viewers to consider how distinct practices coexist, influence one another, and generate new readings through proximity. At the same time, the program continues to raise questions about how artistic value is constructed, perceived, and communicated within a collective exhibition context.</p><p>If one shifts focus away from institutional frameworks, what comes into view are the four participating artists themselves: Haein Kwon, Joon Park Studio, Sora Kim, and Daniel Kwon. Each develops a distinct artistic language while engaging with broader inquiries into perception, representation, and the fragmented nature of contemporary experience. Korea Artist Prize 2024 does not attempt to unify these practices under a singular theme, but instead foregrounds overlapping realities and shifting perspectives, proposing an exhibition that unfolds through intersections rather than fixed narratives.</p><p>As a conceptual framework, the exhibition reflects the condition in which perception is no longer singular or stable, but composed of multiple layers that continuously intersect and transform. Competition, within this context, is reconsidered not as opposition but as a form of interaction, shifting the emphasis toward relationships formed through contact, overlap, and negotiation. The numerical sequence associated with participation can be understood as a set of coordinates guiding movement through the exhibition space, offering multiple pathways rather than fixed hierarchies.</p><p>What forms of perception emerge through the works of Haein Kwon, Joon Park Studio, Sora Kim, and Daniel Kwon? Each approaches the boundaries of visibility from a distinct position, seeking possibilities beyond immediate recognition, and inviting viewers to reconsider how meaning is constructed through encounter, movement, and interpretation. In this sense, the exhibition unfolds as an open field shaped by shifting perspectives and the experiences of those who engage with it.</p>`,
      },
      2023: {
        title: "Layers of Time and Reconstructed Memory",
        author: "Hyerin Cho",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize is a contemporary art initiative that continues to explore how artistic practice engages with time and memory. Each year, four artists or collectives are invited to develop new work within an exhibition context, while selected earlier works are presented alongside them to provide a broader and more layered understanding of their trajectories. Rather than functioning as separate presentations, the exhibition constructs a shared environment in which artistic approaches intersect, encouraging viewers to reflect on how memory is constructed, transformed, and reinterpreted through proximity and dialogue. At the same time, the program raises ongoing questions about how narratives are shaped and how artistic value is communicated within collective frameworks.</p><p>If one shifts focus away from institutional structures, what comes into view are the four participating artists themselves: Minseo Choi, Doha Lee, Eunjae Park, and Jiyoon Han. Each engages with memory as an active and evolving process, moving between personal experience and collective history, and revealing how narratives are continuously reconstructed. Korea Artist Prize 2023 does not treat memory as a fixed record, but as a dynamic condition shaped by interpretation and temporal overlap.</p><p>The exhibition draws from the idea of layered time, where past and present coexist and continuously reshape one another. Within this framework, competition is reconsidered as a dialogue between different approaches to temporality, emphasizing coexistence rather than hierarchy. The numerical sequence associated with participation can be understood as markers of temporal movement, guiding viewers through multiple layers of experience.</p><p>What kinds of narratives emerge from the works of Minseo Choi, Doha Lee, Eunjae Park, and Jiyoon Han? Each artist approaches time from a distinct perspective, inviting viewers to reconsider how memory is constructed and experienced through shifting contexts. The exhibition ultimately unfolds as a space in which time is layered, fragmented, and continuously reimagined.</p>`,
      },
      2022: {
        title: "Unfolding Structures and Shifting Systems",
        author: "Minho Lee",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize provides a platform for examining how contemporary art engages with systems and structures that shape everyday life. Each year, four artists or collectives are invited to develop new work within an exhibition context, while selected earlier works offer insight into the evolution of their practices. Rather than presenting independent exhibitions, the program constructs a shared environment in which diverse approaches intersect, encouraging viewers to consider how systems operate and how they may be challenged, reconfigured, or transformed.</p><p>The participating artists—Sora Kim, Daniel Kwon, Haein Kwon, and Joon Park Studio—investigate structures ranging from social frameworks to visual systems, revealing how they are constructed, maintained, and disrupted. Korea Artist Prize 2022 foregrounds processes of transformation rather than fixed outcomes, highlighting how systems evolve through interaction and change.</p><p>As a conceptual framework, the exhibition examines the fluidity of structures, suggesting that they are not static entities but dynamic configurations shaped through negotiation and reinterpretation. Competition is reconsidered as a form of critical engagement, emphasizing interaction rather than hierarchy. The numerical sequence associated with participation can be understood as a mapping of positions within a shifting system.</p><p>What kinds of structures emerge through the works of Sora Kim, Daniel Kwon, Haein Kwon, and Joon Park Studio? Each artist proposes new ways of understanding how systems are formed and how they might be transformed. The exhibition unfolds as a dynamic field shaped by movement, interaction, and change.</p>`,
      },
      2021: {
        title: "Invisible Forces and Subtle Movements",
        author: "Soyeon Park",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize provides a framework for exploring the subtle dynamics that shape perception and experience in contemporary life. Each year, four artists or collectives are invited to develop new work within an exhibition context, allowing their practices to unfold within a shared environment. Rather than functioning as separate presentations, the exhibition brings together diverse approaches that reveal invisible forces and overlooked movements.</p><p>The participating artists—Eunjae Park, Jiyoon Han, Minseo Choi, and Doha Lee—engage with phenomena that often escape immediate perception, drawing attention to the underlying structures that shape everyday experience. Korea Artist Prize 2021 foregrounds quiet transformations and nuanced shifts, emphasizing sensitivity to change rather than overt expression.</p><p>The conceptual framework of the exhibition is grounded in the idea that significant change often occurs through gradual and subtle processes. Competition is reframed as coexistence, focusing on how different approaches interact without hierarchy. The numerical sequence associated with participation becomes a way of navigating these subtle movements within the exhibition space.</p><p>What kinds of invisible forces emerge through the works of Eunjae Park, Jiyoon Han, Minseo Choi, and Doha Lee? Each artist reveals aspects of reality that remain hidden beneath the surface, inviting viewers to engage with what is not immediately visible. The exhibition unfolds as a field of subtle movement shaped by perception and interpretation.</p>`,
      },
      2020: {
        title: "Distance and Connection in Uncertain Times",
        author: "Jungwoo Kim",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize reflects on the changing conditions of connection in a time defined by uncertainty and transformation. Each year, four artists or collectives are invited to develop new work within an exhibition context, allowing their practices to engage with broader social conditions. Rather than presenting independent exhibitions, the program constructs a shared environment in which distance and connection coexist.</p><p>The participating artists—Daniel Kwon, Haein Kwon, Joon Park Studio, and Sora Kim—explore the complexities of separation and relation, examining how individuals and communities remain connected despite physical and conceptual distance. Korea Artist Prize 2020 foregrounds the tension between isolation and interaction, proposing that distance can generate new forms of engagement.</p><p>The exhibition's conceptual framework examines how relationships are maintained and transformed under changing conditions. Competition is reframed as a shared condition rather than a divisive force, emphasizing collective experience. The numerical sequence associated with participation becomes a way of mapping relational space.</p><p>What kinds of connections emerge through the works of Daniel Kwon, Haein Kwon, Joon Park Studio, and Sora Kim? Each artist proposes new ways of understanding how relationships are formed and sustained. The exhibition unfolds as a network of evolving connections shaped by proximity and distance.</p>`,
      },
      2019: {
        title: "Between Reality and Imagination",
        author: "Yejin Han",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize continues to explore how contemporary art navigates the shifting boundary between reality and imagination. Each year, four artists or collectives are invited to develop new work within an exhibition context, while selected earlier works are presented alongside them to offer a broader understanding of their practices. Rather than functioning as four independent presentations, the exhibition constructs a shared environment in which diverse artistic approaches intersect, encouraging viewers to reconsider how perception is shaped through proximity, interpretation, and transformation.</p><p>If one shifts focus away from institutional frameworks, what comes into view are the four participating artists themselves: Jiyoon Han, Minseo Choi, Doha Lee, and Eunjae Park. Each engages with reality as a fluid condition, transforming familiar elements into unfamiliar forms and constructing new visual and conceptual worlds. Korea Artist Prize 2019 does not attempt to define a singular version of reality, but instead foregrounds multiple interpretations that coexist and interact within the same space.</p><p>The exhibition draws from the idea that imagination is not separate from reality, but deeply embedded within it, continuously reshaping perception. Within this framework, competition is reconsidered as a dialogue between different modes of seeing, emphasizing exchange rather than hierarchy. The numerical sequence associated with participation can be understood as a set of pathways connecting different perspectives.</p><p>What kinds of worlds emerge through the works of Jiyoon Han, Minseo Choi, Doha Lee, and Eunjae Park? Each artist approaches perception from a distinct position, inviting viewers to reconsider the boundaries between what is seen and what is imagined. The exhibition unfolds as a shifting field where reality and imagination continuously overlap and transform.</p>`,
      },
      2018: {
        title: "Material Experiments and Sensory Fields",
        author: "Dahye Shin",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize examines how contemporary art engages with materiality and sensory experience as fundamental aspects of perception. Each year, four artists or collectives are invited to develop new work within an exhibition context, while selected earlier works provide insight into the evolution of their practices. Rather than functioning as separate exhibitions, the program constructs a shared environment in which material approaches intersect, encouraging viewers to engage with works beyond purely visual interpretation.</p><p>The participating artists—Haein Kwon, Eunjae Park, Sora Kim, and Minseo Choi—experiment with diverse materials and processes, revealing how physical substances carry meaning and shape experience. Korea Artist Prize 2018 foregrounds the relationship between body and material, emphasizing how perception is formed through direct engagement.</p><p>The exhibition's conceptual framework is grounded in the idea that material is not neutral, but actively participates in the construction of meaning. Within this context, competition is reframed as a shared exploration of material possibilities rather than a hierarchy of outcomes. The numerical sequence associated with participation becomes a way of mapping sensory encounters across the exhibition space.</p><p>What kinds of experiences emerge through the works of Haein Kwon, Eunjae Park, Sora Kim, and Minseo Choi? Each artist proposes new ways of understanding how material and perception interact. The exhibition unfolds as a field of sensory engagement, where meaning is shaped through interaction and experience.</p>`,
      },
      2017: {
        title: "Fragments of Everyday Life",
        author: "Seungmin Yoo",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize continues to examine how contemporary art engages with the structures of everyday life. Each year, four artists or collectives are invited to develop new work within an exhibition context, while selected earlier works provide insight into the continuity of their practices. Rather than functioning as four separate presentations, the exhibition constructs a shared environment in which diverse approaches intersect, encouraging viewers to reconsider how everyday experience is fragmented and reassembled through artistic processes.</p><p>The participating artists—Jiyoon Han, Doha Lee, Eunjae Park, and Minseo Choi—transform familiar scenes and objects into new visual and conceptual forms, revealing the instability of what is often perceived as ordinary. Korea Artist Prize 2017 foregrounds the idea that the everyday is not fixed, but continuously reshaped through perception and interpretation.</p><p>The conceptual framework of the exhibition draws on the accumulation of fragments, suggesting that meaning emerges not from a singular narrative but from the interaction of multiple elements. Competition is reconsidered as coexistence, emphasizing how different perspectives can intersect without being reduced to comparison. The numerical sequence associated with participation can be understood as a series of entry points into different fragments of experience.</p><p>What kinds of narratives emerge from the works of Jiyoon Han, Doha Lee, Eunjae Park, and Minseo Choi? Each artist reconfigures the familiar into something unfamiliar, inviting viewers to reconsider the structures of everyday perception. The exhibition unfolds as a field of fragmented experiences shaped by both artistic practice and audience interpretation.</p>`,
      },
      2016: {
        title: "Repetition and Variation",
        author: "Jihyun Lee",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize explores how repetition and variation operate within contemporary artistic practice. Each year, four artists or collectives are invited to develop new work within an exhibition context, while selected earlier works reveal the evolution of their methods. Rather than functioning as separate presentations, the exhibition constructs a shared environment in which patterns and differences intersect, encouraging viewers to consider how meaning emerges through repetition.</p><p>The participating artists—Haein Kwon, Sora Kim, Daniel Kwon, and Eunjae Park—engage with repetition as both a formal strategy and a conceptual inquiry, revealing how variation arises within seemingly consistent structures. Korea Artist Prize 2016 foregrounds process over outcome, emphasizing how repetition generates transformation.</p><p>The conceptual framework of the exhibition examines how patterns are constructed and disrupted over time, suggesting that repetition is not static but dynamic. Competition is reframed as a shared exploration of structure, emphasizing interaction rather than hierarchy. The numerical sequence associated with participation becomes a way of mapping variation within repetition.</p><p>What kinds of differences emerge through the works of Haein Kwon, Sora Kim, Daniel Kwon, and Eunjae Park? Each artist reveals how repetition can lead to unexpected transformation. The exhibition unfolds as a field of evolving patterns shaped by perception and change.</p>`,
      },
      2015: {
        title: "Surface and Depth",
        author: "Hana Choi",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize examines how surface and depth function within contemporary art. Each year, four artists or collectives are invited to develop new work within an exhibition context, while selected earlier works provide insight into the development of their practices. Rather than functioning as independent exhibitions, the program constructs a shared environment in which different approaches intersect, encouraging viewers to consider how meaning is constructed across layers.</p><p>The participating artists—Minseo Choi, Jiyoon Han, Doha Lee, and Daniel Kwon—engage with surface as both a visual and conceptual condition, revealing how depth is constructed through perception. Korea Artist Prize 2015 foregrounds the relationship between what is visible and what remains hidden.</p><p>The conceptual framework of the exhibition explores how perception operates across layers, suggesting that surface and depth are interconnected rather than opposed. Competition is reframed as a dialogue between different approaches, emphasizing exchange rather than hierarchy. The numerical sequence associated with participation becomes a way of navigating layers within the exhibition.</p><p>What kinds of relationships emerge through the works of Minseo Choi, Jiyoon Han, Doha Lee, and Daniel Kwon? Each artist explores how surface and depth interact to shape meaning. The exhibition unfolds as a layered field shaped by visibility and concealment.</p>`,
      },
      2014: {
        title: "Constructed Spaces",
        author: "Taehyun Park",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize examines how space is constructed and experienced within contemporary art. Each year, four artists or collectives are invited to develop new work within an exhibition context, while selected earlier works provide insight into their evolving practices. Rather than functioning as separate exhibitions, the program constructs a shared environment in which physical and conceptual spaces intersect.</p><p>The participating artists—Sora Kim, Eunjae Park, Haein Kwon, and Joon Park Studio—approach space as an active process shaped through interaction and perception. Korea Artist Prize 2014 foregrounds the idea that space is not fixed but continuously redefined.</p><p>The conceptual framework of the exhibition explores how spatial experience is constructed through both physical and psychological dimensions. Competition is reframed as a negotiation of space, emphasizing interaction rather than division. The numerical sequence associated with participation becomes a way of navigating spatial relationships.</p><p>What kinds of spaces emerge through the works of Sora Kim, Eunjae Park, Haein Kwon, and Joon Park Studio? Each artist proposes new ways of experiencing space. The exhibition unfolds as an environment shaped by movement and perception.</p>`,
      },
      2013: {
        title: "Emerging Perspectives",
        author: "Yuna Lee",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize explores how new perspectives emerge within contemporary art. Each year, four artists or collectives are invited to develop new work within an exhibition context, while selected earlier works provide insight into the evolution of their practices. Rather than functioning as separate exhibitions, the program constructs a shared environment in which different viewpoints intersect.</p><p>The participating artists—Jiyoon Han, Minseo Choi, Eunjae Park, and Doha Lee—engage with perception as a dynamic process shaped by interpretation and context. Korea Artist Prize 2013 foregrounds the role of perspective in shaping understanding.</p><p>The conceptual framework of the exhibition examines how new ways of seeing emerge through interaction and reinterpretation. Competition is reframed as a dialogue between different viewpoints. The numerical sequence associated with participation becomes a way of navigating perspectives.</p><p>What kinds of perspectives emerge through the works of Jiyoon Han, Minseo Choi, Eunjae Park, and Doha Lee? Each artist proposes new ways of understanding perception. The exhibition unfolds as a space of expanding viewpoints.</p>`,
      },
      2012: {
        title: "New Beginnings",
        author: "Minji Kim",
        role: "Curator / Contemporary Art Institution",
        body: `<p>The Korea Artist Prize marks the beginning of a program dedicated to supporting contemporary artistic practice. Each year, four artists or collectives are invited to develop new work within an exhibition context, establishing a platform for experimentation and production. Rather than functioning as separate exhibitions, the program constructs a shared environment in which diverse practices are introduced.</p><p>The participating artists—Haein Kwon, Sora Kim, Daniel Kwon, and Joon Park Studio—present works that reflect the possibilities of contemporary art at its starting point. Korea Artist Prize 2012 foregrounds experimentation, uncertainty, and potential.</p><p>The conceptual framework of the exhibition explores how new ideas emerge and develop. Competition is reframed as an opportunity for growth rather than evaluation. The numerical sequence associated with participation becomes a way of marking beginnings.</p><p>What kinds of possibilities emerge through the works of Haein Kwon, Sora Kim, Daniel Kwon, and Joon Park Studio? Each artist proposes new directions for artistic practice. The exhibition unfolds as a starting point shaped by exploration and potential.</p>`,
      },
    };

    posters.forEach((poster) => {
      poster.addEventListener("click", () => {
        const year = poster.querySelector(".poster_year");
        if (!year) return;
        const yearText = year.textContent.trim();
        const data = modalData[yearText];
        if (!data) return;

        //모달내용 업데이트
        document.querySelector(".modal_essay_title").innerHTML =
          `<span class="modal_title_line">${data.title}</span><br /><span class="modal_title_line">${data.author}</span>`;
        document.querySelector(".modal_essay_author").textContent = data.role;
        document.querySelector(".modal_essay_body").innerHTML = data.body;

        openModal();
      });
    });

    /* 스크롤로 포스터 슬라이드 연동 */
    window.addEventListener(
      "scroll",
      () => {
        if (tabletMedia.matches) return;
        if (isDragging) return;
        if (!historyWrapper) return;
        const wrapperTop = historyWrapper.getBoundingClientRect().top;
        const scrolled = -wrapperTop;
        const scrollableH = historyWrapper.offsetHeight - window.innerHeight;
        if (scrollableH <= 0) return;
        const rawProgress = Math.min(Math.max(scrolled / scrollableH, 0), 1);

        // 히스토리 섹션: 포스터 이동은 먼저 끝내고 마지막 구간은 머무는 스크롤로 남깁니다.
        const progress = Math.min(rawProgress / historyAnimationEnd, 1);

        applyPosition(MIN_PERCENT + progress * (1 - MIN_PERCENT));
      },
      { passive: true },
    );

    window.addEventListener("load", () => {
      if (tabletMedia.matches) {
        syncFromTabletScroll();
        return;
      }
      applyPosition(MIN_PERCENT);
    });

    window.addEventListener("resize", () => {
      if (tabletMedia.matches) {
        syncFromTabletScroll();
        return;
      }
      applyPosition(currentPercent);
    });

    tabletMedia.addEventListener("change", () => {
      if (tabletMedia.matches) {
        syncFromTabletScroll();
        return;
      }
      applyPosition(currentPercent);
    });
  })();

  /* =============================================
     3번: 모달
  ============================================= */
  function openModal() {
    const overlay = document.getElementById("modalOverlay");
    if (!overlay) return;
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // 모달 열릴 때 제목 배경 초기화
    const modalTitleLines = document.querySelectorAll(".modal_title_line");
    modalTitleLines.forEach((el) => (el.style.background = ""));
    if (
      window.matchMedia("(max-width: 1024px)").matches &&
      modalTitleLines[0]
    ) {
      modalTitleLines[0].style.background =
        "linear-gradient(to right, rgba(255, 102, 36, 0.8) 100%, transparent 100%)";
      modalTitleMaxProgress = 1;
      isFillingTitle = false;
    } else {
      modalTitleMaxProgress = 0;
      isFillingTitle = true;
    }

    // 모달 패널 스크롤 위치 초기화
    const panel = document.getElementById("modalPanel");
    if (panel) panel.scrollTop = 0;
  }

  function closeModal() {
    const overlay = document.getElementById("modalOverlay");
    if (!overlay) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";

    // 모달 닫힐 때 제목 배경 초기화
    document
      .querySelectorAll(".modal_title_line")
      .forEach((el) => (el.style.background = ""));
    modalTitleMaxProgress = 0;
    isFillingTitle = true;
  }

  let modalTitleMaxProgress = 0; // closeModal에서도 접근하려고 밖에 선언

  (function initModal() {
    const overlay = document.getElementById("modalOverlay");
    const panel = document.getElementById("modalPanel");
    const closeBtn = document.getElementById("modalCloseBtn");
    if (!overlay || !panel || !closeBtn) return;

    overlay.addEventListener("click", (e) => {
      if (!panel.contains(e.target)) closeModal();
    });
    closeBtn.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    // 3번 모달 - 제목 배경 채워지는 동안 스크롤 고정, 다 채워지면 해제
    panel.addEventListener(
      "wheel",
      (e) => {
        const lines = document.querySelectorAll(".modal_title_line");
        if (!lines.length) return;

        if (isFillingTitle) {
          e.preventDefault(); // 스크롤 막기

          const progress = Math.min(modalTitleMaxProgress + 0.03, 1); // 휠 한번에 채워지는 속도 조절
          modalTitleMaxProgress = progress;

          lines[0].style.background = `linear-gradient(to right, rgba(255, 102, 36, 0.8) ${progress * 100}%, transparent ${progress * 100}%)`;
          if (lines[1]) {
            lines[1].style.background = "";
          }

          if (modalTitleMaxProgress >= 1) {
            isFillingTitle = false;
          }
        }
      },
      { passive: false },
    ); // passive: false 여야 preventDefault 작동
  })();

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="cursor-ring" id="cursorRing">ENTER ↗</div>
    <div class="cursor-dot" id="cursorDot"></div>
  `,
  );

  const ring = document.getElementById("cursorRing");
  const dot = document.getElementById("cursorDot");
  let mx = 0,
    my = 0,
    rx = window.innerWidth / 2,
    ry = window.innerHeight / 2;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (dot) {
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    }
  });

  (function lerpRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    if (ring) {
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
    }
    requestAnimationFrame(lerpRing);
  })();

  /* =============================================
   4번: Video 섹션 - 스크롤하면 카드 하나씩 등장 후 둥실둥실
============================================= */
  (function initVideoScroll() {
    const wrapper = document.getElementById("videoWrapper");
    if (!wrapper) return;
    const sectionTitle = wrapper.querySelector(".video_section_title");

    const items = [
      document.getElementById("vi0"),
      document.getElementById("vi1"),
      document.getElementById("vi2"),
    ];

    // 각 카드가 등장하는 스크롤 진행률
    const appearAt = [0.1, 0.3, 0.5];
    const animationEnd = 0.65;

    // 페이지 로드 시 transition 미리 설정
    items.forEach((item) => {
      if (!item) return;

      item.style.transition =
        "opacity 0.45s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)";

      const iframe = item.querySelector("iframe");
      if (!iframe) return;

      const baseSrc = iframe.src;
      item.addEventListener("mouseenter", () => {
        iframe.src = baseSrc.replace("mute=1", "mute=1&autoplay=1");
      });
      item.addEventListener("mouseleave", () => {
        iframe.src = baseSrc;
      });
    });

    const mobileMedia = window.matchMedia("(max-width: 480px)");

    // 480px 이하에서는 IntersectionObserver로 처리
    if (mobileMedia.matches) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const item = entry.target;
            if (entry.isIntersecting) {
              item.classList.add("visible");
              window.clearTimeout(item._floatTimerId);
              item._floatTimerId = window.setTimeout(() => {
                item.classList.add("float_active");
              }, 420);
            } else {
              window.clearTimeout(item._floatTimerId);
              item.classList.remove("float_active");
              window.clearTimeout(item._hideTimerId);
              item._hideTimerId = window.setTimeout(() => {
                requestAnimationFrame(() => {
                  item.classList.remove("visible");
                });
              }, 40);
            }
          });
        },
        { threshold: 0.2 }
      );
      items.forEach((item) => { if (item) observer.observe(item); });
      return;
    }

    window.addEventListener(
      "scroll",
      () => {
        const top = wrapper.getBoundingClientRect().top;
        const scrolled = -top;
        const scrollableH = wrapper.offsetHeight - window.innerHeight;
        if (scrollableH <= 0) return;
        const rawProgress = Math.min(Math.max(scrolled / scrollableH, 0), 1);
        const progress = Math.min(rawProgress / animationEnd, 1);
        const titleReachedMidpoint =
          tabletMedia.matches && sectionTitle
            ? sectionTitle.getBoundingClientRect().top <=
              window.innerHeight * 0.58
            : false;

        items.forEach((item, i) => {
          if (!item) return;

          const shouldShow =
            tabletMedia.matches && i === 0
              ? titleReachedMidpoint
              : progress >= appearAt[i];

          if (shouldShow) {
            window.clearTimeout(item._hideTimerId);
            if (item.classList.contains("visible")) return;

            item.classList.add("visible");

            // 비디오 카드: 등장 전환이 끝난 뒤에만 부유 애니메이션을 붙입니다.
            window.clearTimeout(item._floatTimerId);
            item._floatTimerId = window.setTimeout(() => {
              item.classList.add("float_active");
            }, 420);
            return;
          }

          window.clearTimeout(item._floatTimerId);
          item.classList.remove("float_active");
          if (!item.classList.contains("visible")) return;

          // 비디오 카드: 떠다니는 움직임을 먼저 멈추고 다음 프레임에 자연스럽게 숨깁니다.
          window.clearTimeout(item._hideTimerId);
          item._hideTimerId = window.setTimeout(() => {
            requestAnimationFrame(() => {
              item.classList.remove("visible");
            });
          }, 40);
        });
      },
      { passive: true },
    );

    window.dispatchEvent(new Event("scroll"));
  })();
}); // DOMContentLoaded end
