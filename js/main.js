(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const header = document.querySelector(".site-header");

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

  window.addEventListener("scroll", () => {
    if (!scrollTick) scrollTick = requestAnimationFrame(updateScrollUI);
  }, { passive: true });
  updateScrollUI();

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // Reveal observer
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Counter animations
  const animateCounters = () => {
    document.querySelectorAll("[data-counter]").forEach((element) => {
      const target = Number(element.dataset.counterTarget || 0);
      if (!Number.isFinite(target) || element.dataset.counterReady) return;
      element.dataset.counterReady = "true";
      
      if (reduceMotion) {
        element.textContent = String(target);
        return;
      }
      
      const started = performance.now();
      const duration = 1200;
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
    const counterObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        animateCounters();
      }
    }, { threshold: 0.2 });
    document.querySelectorAll("[data-counter]").forEach((item) => counterObserver.observe(item));
  } else {
    animateCounters();
  }

  // PRODUCT INTERACTION LAB & LIVE CANVAS VISUALIZER
  const visualizer = document.getElementById("visualizer-canvas");
  if (visualizer) {
    const context = visualizer.getContext("2d", { alpha: true });
    if (context) {
      const profiles = {
        studio: {
          color: "#b7ff3c", amplitude: 0.75, density: 1.4,
          title: "Active: Studio Reference",
          desc: "Pure studio reference curve with flat response across 20 Hz – 24 kHz.",
          sr: "96 kHz / 24-bit", lat: "12 ms", mode: "Reference"
        },
        quiet: {
          color: "#d8dad5", amplitude: 0.35, density: 0.8,
          title: "Active: Quiet Mode",
          desc: "Attenuates low-frequency ambient rumble while preserving vocal clarity.",
          sr: "96 kHz / 24-bit", lat: "8 ms", mode: "Quiet Room"
        },
        spatial: {
          color: "#8fdc31", amplitude: 1.1, density: 2.2,
          title: "Active: Spatial Field",
          desc: "Dynamic spatial expansion algorithm rendering a three-dimensional acoustic soundstage.",
          sr: "192 kHz / 24-bit", lat: "15 ms", mode: "3D Spatial"
        },
        focus: {
          color: "#e2ff70", amplitude: 0.6, density: 1.8,
          title: "Active: Focus Profile",
          desc: "Emphasizes speech spectrum intelligibility while dampening persistent background noise.",
          sr: "96 kHz / 24-bit", lat: "10 ms", mode: "Voice Focus"
        }
      };

      let current = profiles.studio;
      let frame = 0;
      let visible = true;
      let running = true;

      const resize = () => {
        const rect = visualizer.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        visualizer.width = Math.max(1, Math.floor(rect.width * dpr));
        visualizer.height = Math.max(1, Math.floor(rect.height * dpr));
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      const draw = () => {
        if (!visible) {
          running = false;
          return;
        }
        const width = visualizer.clientWidth;
        const height = visualizer.clientHeight;

        context.clearRect(0, 0, width, height);

        // Grid lines
        context.strokeStyle = "rgba(255,255,255,.05)";
        context.lineWidth = 1;
        for (let y = 0; y < height; y += 40) {
          context.beginPath();
          context.moveTo(0, y + 0.5);
          context.lineTo(width, y + 0.5);
          context.stroke();
        }

        // Primary waveform
        context.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const progress = x / Math.max(width, 1);
          const wave = Math.sin(progress * 16 * current.density + frame * 0.03) * 18 * current.amplitude;
          const harmonic = Math.sin(progress * 40 * current.density - frame * 0.04) * 6 * current.amplitude;
          const y = height / 2 + wave + harmonic;
          x === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
        }

        context.strokeStyle = current.color;
        context.shadowColor = current.color;
        context.shadowBlur = 12;
        context.lineWidth = 2;
        context.stroke();
        context.shadowBlur = 0;

        if (!reduceMotion) frame += 1;
        requestAnimationFrame(draw);
      };

      resize();
      draw();
      window.addEventListener("resize", resize, { passive: true });

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible && !running) {
            running = true;
            requestAnimationFrame(draw);
          }
        }, { threshold: 0.05 }).observe(visualizer);
      }

      // Tab switcher
      document.querySelectorAll("[data-profile]").forEach((tab) => {
        tab.addEventListener("click", () => {
          const key = tab.dataset.profile;
          if (!profiles[key]) return;
          current = profiles[key];

          document.querySelectorAll("[data-profile]").forEach((btn) => {
            const active = btn === tab;
            btn.classList.toggle("active", active);
            btn.setAttribute("aria-selected", String(active));
          });

          document.getElementById("profile-title").textContent = current.title;
          document.getElementById("profile-explanation").textContent = current.desc;
          document.getElementById("metric-sr").textContent = current.sr;
          document.getElementById("metric-lat").textContent = current.lat;
          document.getElementById("metric-mode").textContent = current.mode;
        });
      });
    }
  }

  // INTERACTIVE "HOW IT FEELS" SECTION
  const feelsData = {
    immersion: {
      badge: "STATE: TOTAL ISOLATION",
      title: "Immersion",
      desc: "Background noise collapses. Sound takes on physical depth, surrounding you with studio precision and unfiltered dynamic range.",
      fill: "95%"
    },
    awareness: {
      badge: "STATE: TRANSPARENT PASS-THROUGH",
      title: "Awareness",
      desc: "Microphones stream surrounding environmental audio in real time with near-zero acoustic phase offset.",
      fill: "40%"
    },
    focus: {
      badge: "STATE: SPEECH ENHANCEMENT",
      title: "Focus",
      desc: "Identifies and isolates human voice frequencies while dampening mechanical background noise.",
      fill: "80%"
    },
    comfort: {
      badge: "STATE: ALL-DAY ERGONOMICS",
      title: "Comfort",
      desc: "Pressure-equalizing acoustic vents prevent occlusion effect, creating an effortless listening experience.",
      fill: "20%"
    }
  };

  document.querySelectorAll("[data-feel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.feel;
      const data = feelsData[key];
      if (!data) return;

      document.querySelectorAll("[data-feel]").forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });

      const badge = document.getElementById("feels-badge");
      const title = document.getElementById("feels-title");
      const desc = document.getElementById("feels-desc");
      const bar = document.getElementById("feels-bar-fill");

      if (badge) badge.textContent = data.badge;
      if (title) title.textContent = data.title;
      if (desc) desc.textContent = data.desc;
      if (bar) bar.style.width = data.fill;
    });
  });

  if (finePointer && !reduceMotion) {
    window.addEventListener("pointermove", (e) => {
      const x = (e.clientX / Math.max(window.innerWidth, 1) - 0.5);
      const y = (e.clientY / Math.max(window.innerHeight, 1) - 0.5);
      document.documentElement.style.setProperty("--pointer-x", x.toFixed(3));
      document.documentElement.style.setProperty("--pointer-y", y.toFixed(3));
    }, { passive: true });
  }
})();