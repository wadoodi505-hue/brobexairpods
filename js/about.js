/**
 * BROBEX - About Page Interactions
 * Handles scroll-based typography movement and performance optimization.
 */
(() => {
  // Respect user motion preferences
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const typoRights = document.querySelectorAll('.typo-right');
  const typoLefts = document.querySelectorAll('.typo-left');
  const scrollSection = document.querySelector('.scroll-typography-section');
  
  let rafId;
  let scrollY = window.scrollY;
  let isIntersecting = false;

  // Render loop for smooth typography parallax
  const renderTypography = () => {
    if (!isIntersecting) return;
    
    // Calculate scroll progress relative to the section's position
    const rect = scrollSection.getBoundingClientRect();
    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    
    // Clamp progress between 0 and 1
    const clampedProgress = Math.max(0, Math.min(1, progress));
    
    // Translate values based on direction
    const rightOffset = (clampedProgress - 0.5) * 150; 
    const leftOffset = (clampedProgress - 0.5) * -150;

    typoRights.forEach(el => {
      el.style.transform = `translate3d(${rightOffset}px, 0, 0)`;
    });
    
    typoLefts.forEach(el => {
      el.style.transform = `translate3d(${leftOffset}px, 0, 0)`;
    });
    
    rafId = requestAnimationFrame(renderTypography);
  };

  // Intersection Observer to pause off-screen animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isIntersecting = entry.isIntersecting;
      
      if (isIntersecting) {
        rafId = requestAnimationFrame(renderTypography);
      } else {
        cancelAnimationFrame(rafId);
      }
    });
  }, { 
    threshold: 0,
    rootMargin: '100px 0px' 
  });

  if (scrollSection) {
    observer.observe(scrollSection);
  }
})();