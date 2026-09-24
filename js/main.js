(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const header = document.querySelector(".site-header");
  if (!document.querySelector("[data-scroll-progress]")) {
    const scrollProgress = document.createElement("div");
    scrollProgress.className = "global-scroll-progress";
    scrollProgress.dataset.scrollProgress = "";
    scrollProgress.setAttribute("aria-hidden", "true");
    scrollProgress.innerHTML = "<span></span>";
    document.body.prepend(scrollProgress);
  }
  let scrollTick = 0;

  const updateScrollUI = () => {
    scrollTick = 0;
    header?.classList.toggle("scrolled", window.scrollY > 20);
    const progress = document.querySelector("[data-scroll-progress] span");
    if (progress) {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.transform = `scaleX(${Math.min(1, window.scrollY / maxScroll)})`;
    }
  };

  const requestScrollUI = () => {
    if (!scrollTick) scrollTick = window.requestAnimationFrame(updateScrollUI);
  };

  updateScrollUI();
  window.addEventListener("scroll", requestScrollUI, { passive: true });

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const wrapHeadingLetters = (element) => {
    if (reduceMotion || element.dataset.lettersReady) return;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => node.nodeValue.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    });
    const textNodes = [];
    let currentNode;
    while ((currentNode = walker.nextNode())) textNodes.push(currentNode);

    let letterIndex = 0;
    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach((word) => {
        if (!word || /^\s+$/.test(word)) {
          fragment.appendChild(document.createTextNode(word));
          return;
        }
        const wordWrap = document.createElement("span");
        wordWrap.className = "heading-word";
        [...word].forEach((character) => {
          const letter = document.createElement("span");
          letter.className = "heading-letter";
          letter.textContent = character;
          letter.style.setProperty("--letter-delay", `${Math.min(letterIndex, 32) * 22}ms`);
          wordWrap.appendChild(letter);
          letterIndex += 1;
        });
        fragment.appendChild(wordWrap);
      });
      node.replaceWith(fragment);
    });
    element.classList.add("letter-heading");
    element.dataset.lettersReady = "true";
    requestAnimationFrame(() => element.classList.add("letters-visible"));
  };

  document.querySelectorAll(".sequence-copy h1, .page-hero h1, .section-title, .contact-aside h2, .quote")
    .forEach(wrapHeadingLetters);

  const animateCounters = () => {
    document.querySelectorAll("[data-counter]").forEach((element) => {
      const target = Number(element.dataset.counterTarget || element.textContent || 0);
      if (!Number.isFinite(target) || element.dataset.counterReady) return;
      element.dataset.counterReady = "true";
      if (reduceMotion) {
        element.textContent = String(target);
        return;
      }
      const started = performance.now();
      const duration = 1000;
      const tick = (now) => {
        const progress = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries, instance) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        animateCounters();
        instance.disconnect();
      }
    }, { threshold: 0.25 });
    document.querySelectorAll("[data-counter]").forEach((item) => counterObserver.observe(item));
  } else {
    animateCounters();
  }

  const visualizer = document.getElementById("visualizer-canvas");
  if (visualizer) {
    const context = visualizer.getContext("2d", { alpha: true, desynchronized: true });
    if (context) {
      const profiles = {
        studio: { color: "#b7ff3c", amplitude: 0.75, density: 1.4, title: "Active: Pure studio reference", design: "Concept profile" },
        quiet: { color: "#d8dad5", amplitude: 0.38, density: 0.8, title: "Active: Quiet room", design: "Concept profile" },
        spatial: { color: "#8fdc31", amplitude: 1.05, density: 2.1, title: "Active: Spatial field", design: "Concept profile" }
      };
      let profile = profiles.studio;
      let frame = 0;
      let visible = true;
      let running = true;
      let resizeFrame = 0;

      const resize = () => {
        resizeFrame = 0;
        const rect = visualizer.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        visualizer.width = Math.max(1, Math.floor(rect.width * dpr));
        visualizer.height = Math.max(1, Math.floor(rect.height * dpr));
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      const requestResize = () => {
        if (!resizeFrame) resizeFrame = requestAnimationFrame(resize);
      };
      const draw = () => {
        if (!visible) {
          running = false;
          return;
        }
        const width = visualizer.clientWidth;
        const height = visualizer.clientHeight;
        context.clearRect(0, 0, width, height);
        context.strokeStyle = "rgba(255,255,255,.07)";
        context.lineWidth = 1;
        for (let y = 0; y < height; y += 42) {
          context.beginPath();
          context.moveTo(0, y + 0.5);
          context.lineTo(width, y + 0.5);
          context.stroke();
        }
        context.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const progress = x / Math.max(width, 1);
          const wave = Math.sin(progress * 16 * profile.density + frame * 0.025) * 16 * profile.amplitude;
          const harmonic = Math.sin(progress * 43 * profile.density - frame * 0.04) * 5 * profile.amplitude;
          const y = height / 2 + wave + harmonic;
          x === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
        }
        context.strokeStyle = profile.color;
        context.shadowColor = profile.color;
        context.shadowBlur = 14;
        context.lineWidth = 1.8;
        context.stroke();
        context.shadowBlur = 0;
        if (!reduceMotion) frame += 1;
        requestAnimationFrame(draw);
      };

      resize();
      draw();
      window.addEventListener("resize", requestResize, { passive: true });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible && !running) {
            running = true;
            requestAnimationFrame(draw);
          }
        }, { threshold: 0.05 }).observe(visualizer);
      }

      document.querySelectorAll("[data-profile]").forEach((tab) => {
        tab.addEventListener("click", () => {
          profile = profiles[tab.dataset.profile] || profiles.studio;
          document.querySelectorAll("[data-profile]").forEach((item) => {
            const active = item === tab;
            item.classList.toggle("active", active);
            item.setAttribute("aria-selected", String(active));
          });
          const title = document.getElementById("profile-title");
          const status = document.getElementById("profile-status");
          if (title) title.textContent = profile.title;
          if (status) status.textContent = profile.design;
        });
      });
    }
  }

  if (finePointer && !reduceMotion) {
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const updatePointer = () => {
      pointerFrame = 0;
      document.documentElement.style.setProperty("--pointer-x", pointerX.toFixed(3));
      document.documentElement.style.setProperty("--pointer-y", pointerY.toFixed(3));
    };
    window.addEventListener("pointermove", (event) => {
      pointerX = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
      pointerY = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
    }, { passive: true });
  }
})();