/**
 * 155-Frame Cinematic Canvas Scroll Engine
 * Handled via requestAnimationFrame & smooth interpolation
 */
(() => {
  const TOTAL_FRAMES = 155;
  const FRAME_PATH = (index) => `assets/frames/ezgif-frame-${String(index + 1).padStart(3, '0')}.png`;
  const LERP_FACTOR = 0.09;

  const sequence = document.querySelector('.sequence');
  if (!sequence) return;

  const sticky = sequence.querySelector('.sequence-sticky');
  const canvas = sequence.querySelector('.sequence-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  const cache = new Map();
  
  let targetProgress = 0;
  let currentProgress = 0;
  let desiredFrame = 0;
  let lastDrawnFrame = -1;
  let isLerping = false;
  let sequenceVisible = false;

  const chapterSteps = document.querySelectorAll('.chapter-step');
  const storyCopies = document.querySelectorAll('.story-copy');
  const counterBadge = document.getElementById('frame-counter-badge');
  const progressBar = document.getElementById('sequence-progress-bar');

  const resizeCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    draw(true);
  };

  const fetchImage = (index) => {
    if (cache.has(index)) return cache.get(index);

    const img = new Image();
    img.decoding = 'async';
    const frameData = { img, loaded: false };
    cache.set(index, frameData);

    img.onload = () => {
      frameData.loaded = true;
      if (index === desiredFrame) draw(true);
    };

    img.src = FRAME_PATH(index);
    return frameData;
  };

  const warmWindow = (centerFrame) => {
    for (let i = -12; i <= 12; i++) {
      const target = centerFrame + i;
      if (target >= 0 && target < TOTAL_FRAMES) fetchImage(target);
    }
  };

  const draw = (forceRedraw = false) => {
    if (!forceRedraw && desiredFrame === lastDrawnFrame) return;

    const frameData = fetchImage(desiredFrame);
    let imageToDraw = null;

    if (frameData && frameData.loaded) {
      imageToDraw = frameData.img;
      lastDrawnFrame = desiredFrame;
    } else {
      const fallback = cache.get(lastDrawnFrame);
      if (fallback && fallback.loaded) imageToDraw = fallback.img;
    }

    if (!imageToDraw) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / imageToDraw.naturalWidth, ch / imageToDraw.naturalHeight);
    const rw = imageToDraw.naturalWidth * scale;
    const rh = imageToDraw.naturalHeight * scale;
    const ox = (cw - rw) / 2;
    const oy = (ch - rh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(imageToDraw, ox, oy, rw, rh);
  };

  const updateUI = (progress) => {
    if (counterBadge) {
      counterBadge.textContent = `FRAME ${String(desiredFrame + 1).padStart(3, '0')} / ${TOTAL_FRAMES}`;
    }

    if (progressBar) {
      progressBar.style.transform = `scaleX(${progress})`;
    }

    // Determine current chapter (5 equal zones)
    const chapterIndex = Math.min(4, Math.floor(progress * 5));

    chapterSteps.forEach((step, idx) => {
      const active = idx === chapterIndex;
      step.classList.toggle('active', active);
    });

    storyCopies.forEach((copy, idx) => {
      const active = idx === chapterIndex;
      copy.classList.toggle('active', active);
    });
  };

  const renderLoop = () => {
    if (!sequenceVisible) {
      isLerping = false;
      return;
    }

    currentProgress += (targetProgress - currentProgress) * LERP_FACTOR;
    desiredFrame = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1))));

    warmWindow(desiredFrame);
    draw();
    updateUI(currentProgress);

    if (Math.abs(targetProgress - currentProgress) > 0.0002) {
      requestAnimationFrame(renderLoop);
    } else {
      isLerping = false;
    }
  };

  const updateSequence = () => {
    const rect = sequence.getBoundingClientRect();
    const scrollable = Math.max(1, sequence.offsetHeight - sticky.offsetHeight);
    targetProgress = Math.min(1, Math.max(0, -rect.top / scrollable));

    if (sequenceVisible && !isLerping) {
      isLerping = true;
      requestAnimationFrame(renderLoop);
    }
  };

  // Chapter step click handler
  chapterSteps.forEach((step) => {
    step.addEventListener('click', () => {
      const index = Number(step.dataset.chapter || 0);
      const targetRatio = index / 4;
      const scrollable = Math.max(1, sequence.offsetHeight - sticky.offsetHeight);
      const targetTop = sequence.offsetTop + targetRatio * scrollable;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  const observer = new IntersectionObserver(([entry]) => {
    sequenceVisible = entry.isIntersecting;
    if (sequenceVisible) updateSequence();
  }, { threshold: 0 });

  observer.observe(sequence);

  const init = () => {
    resizeCanvas();
    for (let i = 0; i < 25; i++) fetchImage(i);
    updateSequence();
  };

  window.addEventListener('scroll', updateSequence, { passive: true });
  window.addEventListener('resize', resizeCanvas, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();