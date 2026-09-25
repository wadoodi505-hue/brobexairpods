/**
 * BROBEX Premium Audio Logic
 * Handles interactive feature accordion state mapping
 */
(function () {
  // Feature Explorer Accordion Logic
  const featureCards = document.querySelectorAll('.feature-accordion-card');
  
  if (featureCards.length > 0) {
    featureCards.forEach((card) => {
      card.addEventListener('click', () => {
        const isAlreadyActive = card.classList.contains('active');
        
        // Reset all cards
        featureCards.forEach((c) => {
          c.classList.remove('active');
          c.setAttribute('aria-expanded', 'false');
        });

        // Toggle clicked card
        if (!isAlreadyActive) {
          card.classList.add('active');
          card.setAttribute('aria-expanded', 'true');
        }
      });
      
      // Accessibility: allow keyboard toggle
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }
})();