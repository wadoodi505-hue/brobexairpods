/* js/work.js */
/* BROBEX Portfolio Data & Logic - Live Builds Portfolio */

(function () {
  'use strict';

  // COMPLETE REPLACEMENT WITH YOUR 6 LIVE BUILDS
  const projectsData = [
    {
      id: 'bx-game-website',
      number: '01 / 06',
      title: 'BX Game Website',
      category: 'Frontend',
      type: 'Frontend Website',
      tech: ['HTML', 'CSS', 'JavaScript'],
      shortDesc: 'A visually engaging gaming frontend focused on immersive presentation, responsive layouts, and an interactive user experience.',
      desc: 'Built with a dark gaming visual palette, custom UI components, responsive layout structures, and high-performance frontend interactions.',
      demoUrl: 'https://brpobex-website-only-front-end.vercel.app/'
    },
    {
      id: 'coffee-website',
      number: '02 / 06',
      title: 'Coffee Website',
      category: 'Frontend',
      type: 'Frontend Website',
      tech: ['HTML', 'CSS', 'JavaScript'],
      shortDesc: 'A product-focused coffee experience combining warm visual presentation, responsive layout, modern UI, and smooth interactions.',
      desc: 'Designed around rich visual storytelling, seamless menu browsing, warm aesthetic tones, and smooth client-side interactions.',
      demoUrl: 'https://coffee-demo-u1xg.vercel.app/'
    },
    {
      id: 'premium-plumbing-website',
      number: '03 / 06',
      title: 'Premium Plumbing Website',
      category: 'Business',
      type: 'Business Website',
      tech: ['HTML', 'CSS', 'JavaScript'],
      shortDesc: 'A premium service website built around credible business presentation, strong calls to action, and responsive frontend implementation.',
      desc: 'Engineered for high user conversion, structured service breakdowns, floating contact controls, and clean corporate branding.',
      demoUrl: 'https://brobex-premium-plumbing.vercel.app/'
    },
    {
      id: 'three-men-mirror',
      number: '04 / 06',
      title: 'Three Men Mirror',
      category: 'Games',
      type: 'Interactive Game',
      tech: ['HTML', 'CSS', 'JavaScript'],
      shortDesc: 'An interactive browser game focused on visual interaction, gameplay feedback, and a playful frontend experience.',
      desc: 'Features custom game visual states, lightweight canvas/DOM manipulation, dynamic score feedback, and immediate response loops.',
      demoUrl: 'https://the-men-mirrors-brobex.vercel.app/'
    },
    {
      id: 'stack-tower',
      number: '05 / 06',
      title: 'Stack Tower',
      category: 'Games',
      type: 'Featured / Interactive Game',
      tech: ['HTML', 'CSS', 'JavaScript'],
      shortDesc: 'Designed and engineered as a central digital showcase for high-grade web builds. Features a custom dark-mode aesthetic, micro-interactions, seamless responsive breakpoints, dynamic project filtering, and accessible modal architecture. ',
      desc: 'Designed and engineered as a central digital showcase for high-grade web builds. Features a custom dark-mode aesthetic, micro-interactions, seamless responsive breakpoints, dynamic project filtering, and accessible modal architecture.',
      demoUrl: 'https://brobexportfolio.vercel.app/'
    },
    {
      id: 'tic-tac-toe',
      number: '06 / 06',
      title: 'Tic Tac Toe',
      category: 'Games',
      type: 'Interactive Game',
      tech: ['HTML', 'CSS', 'JavaScript'],
      shortDesc: 'A browser-based Tic Tac Toe experience with interactive gameplay, responsive implementation, and a clear game interface.',
      desc: 'Features responsive grid layouts, custom winning detection algorithms, reset capabilities, and clean UI state transitions.',
      demoUrl: 'https://tic-tak-toe-game-brobex.vercel.app/'
    }
  ];

  // DOM Elements
  const gridContainer = document.getElementById('dynamic-work-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('project-search');
  const modal = document.getElementById('project-modal');
  let currentFilter = 'all';
  let searchQuery = '';

  // Render Grid Function
  function renderGrid() {
    if (!gridContainer) return;
    gridContainer.classList.add('filtering');
    
    setTimeout(() => {
      gridContainer.innerHTML = '';
      
      const filtered = projectsData.filter(p => {
        const matchFilter = currentFilter === 'all' || 
                            p.category.toLowerCase() === currentFilter.toLowerCase() || 
                            p.tech.some(t => t.toLowerCase() === currentFilter.toLowerCase());
                            
        const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.tech.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.number.toLowerCase().includes(searchQuery.toLowerCase());
                            
        return matchFilter && matchSearch;
      });

      if (filtered.length === 0) {
        gridContainer.innerHTML = `<div class="no-results">No live projects found matching your search.</div>`;
      } else {
        filtered.forEach((p, index) => {
          const delayClass = `delay-${index % 3}`;
          const techHtml = p.tech.map(t => `<span>${t}</span>`).join('');
          
          const card = document.createElement('div');
          card.className = `project-card reveal is-visible ${delayClass}`;
          card.dataset.id = p.id;
          
          card.innerHTML = `
            <div class="card-image-box">
              <img src="assets/brobex-logo.png" alt="${p.title}" loading="lazy">
            </div>
            <div class="card-content">
              <div class="card-header">
                <span class="card-number" style="font-size: 11px; color: var(--gold); font-weight: 700; letter-spacing: 0.1em;">${p.number}</span>
                <span class="card-category">${p.category}</span>
              </div>
              <h3 class="card-title" style="margin: 8px 0 12px; font-size: 22px;">${p.title}</h3>
              <p class="card-desc">${p.shortDesc}</p>
              <div class="card-tech" style="margin-bottom: 20px;">${techHtml}</div>
              <div style="margin-top: auto; display: flex; gap: 10px; align-items: center;">
                <a href="${p.demoUrl}" target="_blank" rel="noopener noreferrer" class="button primary" style="padding: 8px 16px; font-size: 12px; width: 100%; text-align: center; justify-content: center;" onclick="event.stopPropagation();">
                  View Live Project ↗
                </a>
              </div>
            </div>
          `;
          
          card.addEventListener('click', () => openModal(p.id));
          gridContainer.appendChild(card);
        });
      }
      
      gridContainer.classList.remove('filtering');
    }, 200);
  }

  // Filter Event Listeners
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      const target = e.currentTarget;
      target.classList.add('active');
      target.setAttribute('aria-selected', 'true');
      
      currentFilter = target.dataset.filter;
      renderGrid();
    });
  });

  // Search Input Event Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderGrid();
    });
  }

  // Modal Handlers
  function openModal(id) {
    const project = projectsData.find(p => p.id === id);
    if (!project || !modal) return;

    document.getElementById('modal-num').textContent = project.number;
    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-type').textContent = project.type;
    document.getElementById('modal-desc').textContent = project.desc;
    
    const techContainer = document.getElementById('modal-tech');
    techContainer.innerHTML = project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    
    const liveLink = document.getElementById('modal-live-link');
    liveLink.href = project.demoUrl;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  const featuredBtns = document.querySelectorAll('.open-modal-btn');
  featuredBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(e.currentTarget.dataset.id);
    });
  });

  // Initial Load
  renderGrid();

})();
// Add or update the featured project entry in your modal data object
const featuredProjectData = {
  id: "featured-brobex",
  number: "00 / 06",
  title: "BROBEX Portfolio",
  category: "Professional Portfolio",
  badge: "00 / 06 — FEATURED BUILD",
  description: "A premium personal portfolio engineered to showcase modern frontend development, interactive experiences, responsive design, and high-performance web interfaces.",
  longDescription: "Designed and engineered as a central digital showcase for high-grade web builds. Features a custom dark-mode aesthetic, micro-interactions, seamless responsive breakpoints, dynamic project filtering, and accessible modal architecture.",
  tech: ["HTML", "CSS", "JavaScript", "Responsive Design"],
  liveUrl: "https://brobexportfolio.vercel.app/",
  image: "assets/brobex-logo.png"
};

// Ensure modal click event listener checks for 'featured-brobex'
document.querySelectorAll('.view-details-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const id = e.currentTarget.getAttribute('data-project-id');
    if (id === 'featured-brobex') {
      openModal(featuredProjectData);
    } else {
      // Handles standard 6 archive projects without modification
      const project = projectsData.find(p => p.id === id);
      if (project) openModal(project);
    }
  });
});