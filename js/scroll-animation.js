/**
 * Dynamic Frame-Sequence Scroll Engine
 * - Smooth Lerp (Linear Interpolation)
 * - Synchronous Canvas Drawing (Fixes flashing/black frames bug)
 * - No Loading Screens
 */

(() => {
  // 1. Configuration
  const TOTAL_FRAMES = 155;
 const FRAME_PATH = (index) => `assets/frames/ezgif-frame-${String(index + 1).padStart(3, '0')}.png`;
  const LERP_FACTOR = 0.08; 

  // 2. DOM Selectors
const sequence = document.querySelector('.sequence') || document.body;
const sticky = document.querySelector('.sequence-sticky') || sequence;
  const canvas = document.querySelector('.sequence-canvas');

  // Remove any remaining loading text or overlays automatically
  const hideLoaders = () => {
    const loaders = document.querySelectorAll('.loading-screen, #loader, .progress-container, .loader');
    loaders.forEach(el => el.style.display = 'none');
  };
  hideLoaders();

  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  
  // 3. State Management
  const cache = new Map(); // Stores { img: HTMLImageElement, loaded: boolean }
  let targetProgress = 0;
  let currentProgress = 0;
  let desiredFrame = 0;
  let lastDrawnFrame = -1;
  let isLerping = false;
  let sequenceVisible = false;

  // 4. Dynamic DPR Resize Handler
  const resizeCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    draw(true);
  };

  // 5. Synchronous Image Preloader
  const fetchImage = (index) => {
    if (cache.has(index)) return cache.get(index);

    const img = new Image();
    img.decoding = 'async';
    
    const frameData = { img, loaded: false };
    cache.set(index, frameData);

    img.onload = () => {
      frameData.loaded = true;
      // If the user is waiting on this exact frame, draw it immediately
      if (index === desiredFrame) draw(true);
    };
    
    img.src = FRAME_PATH(index);
    return frameData;
  };

  // Look-ahead Pre-warmer
  const warmWindow = (centerFrame) => {
    for (let i = -15; i <= 15; i++) {
      const target = centerFrame + i;
      if (target >= 0 && target < TOTAL_FRAMES) {
        fetchImage(target);
      }
    }
  };

  // 6. Synchronous Draw Function (Zero Flashing)
  const draw = (forceRedraw = false) => {
    if (!forceRedraw && desiredFrame === lastDrawnFrame) return;

    const frameData = fetchImage(desiredFrame);
    let imageToDraw = null;

    // Check if the exact frame we want is ready
    if (frameData && frameData.loaded) {
      imageToDraw = frameData.img;
      lastDrawnFrame = desiredFrame;
    } else {
      // Fallback: If not ready, draw the last known loaded frame to prevent black screens
      const fallback = cache.get(lastDrawnFrame);
      if (fallback && fallback.loaded) {
        imageToDraw = fallback.img;
      }
    }

    if (!imageToDraw) return; // Wait for first frame to load

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

  // 7. Easing Render Loop
  const renderLoop = () => {
    if (!sequenceVisible) {
      isLerping = false;
      return;
    }

    currentProgress += (targetProgress - currentProgress) * LERP_FACTOR;
    desiredFrame = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1))));

    warmWindow(desiredFrame);
    draw();

    if (Math.abs(targetProgress - currentProgress) > 0.0001) {
      requestAnimationFrame(renderLoop);
    } else {
      isLerping = false;
    }
  };

  // 8. Scroll Tracker (No Loading Percentage Updates)
  const updateSequence = () => {
    const rect = sequence.getBoundingClientRect();
    const scrollable = Math.max(1, sequence.offsetHeight - sticky.offsetHeight);
    
    // Clamp between 0 and 1
    targetProgress = Math.min(1, Math.max(0, -rect.top / scrollable));

    if (sequenceVisible && !isLerping) {
      isLerping = true;
      requestAnimationFrame(renderLoop);
    }
  };

  // 9. Intersection Observer (Auto-Pause)
  const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        sequenceVisible = entry.isIntersecting;
        if (sequenceVisible) updateSequence();
      });
    },
    { threshold: 0 }
  );
  observer.observe(sequence);

  // 10. Initialization
  const init = () => {
    resizeCanvas();
    for (let i = 0; i < Math.min(30, TOTAL_FRAMES); i++) fetchImage(i);
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