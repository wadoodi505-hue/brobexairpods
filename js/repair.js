// js/repair.js
(function () {
  'use strict';

  // Config: Premium Repair Categories mapped to Devices with descriptions
  const repairCategories = {
    iphone: [
      { id: 'display', title: 'Display', icon: '📱', desc: 'Cracked, broken, flickering or unresponsive screen.' },
      { id: 'battery', title: 'Battery', icon: '🔋', desc: 'Rapid drain, unexpected shutdowns or poor health.' },
      { id: 'charging', title: 'Charging', icon: '⚡', desc: 'Port loose, debris block, or failing to charge.' },
      { id: 'camera', title: 'Camera', icon: '📷', desc: 'Blurry lens, physical damage, or app failure.' },
      { id: 'audio', title: 'Audio', icon: '🔊', desc: 'Speaker or microphone distortion/failure.' },
      { id: 'buttons', title: 'Buttons', icon: '🔘', desc: 'Power or volume buttons stuck or unresponsive.' },
      { id: 'software', title: 'Software', icon: '💻', desc: 'Boot loops, logo stuck, or update failures.' },
      { id: 'water', title: 'Water Damage', icon: '💧', desc: 'Liquid exposure requires immediate assessment.' },
      { id: 'other', title: 'Other Issue', icon: '⚙️', desc: 'Hardware fault not listed above.' }
    ],
    android: [
      { id: 'display', title: 'Display', icon: '📱', desc: 'OLED/LCD damage or touch failure.' },
      { id: 'battery', title: 'Battery', icon: '🔋', desc: 'Swollen or degraded battery performance.' },
      { id: 'charging', title: 'Charging', icon: '⚡', desc: 'USB-C port damage or lint buildup.' },
      { id: 'camera', title: 'Camera', icon: '📷', desc: 'Focus issues, cracked glass.' },
      { id: 'audio', title: 'Audio', icon: '🔊', desc: 'Distorted earpiece or loudspeaker.' },
      { id: 'software', title: 'Software', icon: '💻', desc: 'Firmware corruption or bootloop.' },
      { id: 'water', title: 'Water Damage', icon: '💧', desc: 'Liquid ingress diagnosis.' },
      { id: 'other', title: 'Other Issue', icon: '⚙️', desc: 'Back glass, sensors, etc.' }
    ],
    tablet: [
      { id: 'display', title: 'Display', icon: '📱', desc: 'Large panel glass fracture or digitizer issue.' },
      { id: 'battery', title: 'Battery', icon: '🔋', desc: 'Will not hold charge for reasonable duration.' },
      { id: 'charging', title: 'Charging', icon: '⚡', desc: 'Port damaged from cable tension.' },
      { id: 'software', title: 'Software', icon: '💻', desc: 'OS restore required.' },
      { id: 'water', title: 'Water Damage', icon: '💧', desc: 'Liquid assessment.' },
      { id: 'other', title: 'Other Issue', icon: '⚙️', desc: 'Buttons, audio, or casing.' }
    ],
    other: [
      { id: 'display', title: 'Display', icon: '📱', desc: 'Visual output failure.' },
      { id: 'battery', title: 'Power', icon: '🔋', desc: 'Power delivery issues.' },
      { id: 'software', title: 'Software', icon: '💻', desc: 'System level failures.' },
      { id: 'other', title: 'General Diagnostics', icon: '⚙️', desc: 'Comprehensive hardware check.' }
    ]
  };

  // State Management
  const state = {
    step: 1,
    device: null,
    issue: null,
    condition: null,
    issueTitle: null
  };

  // DOM Elements Initialization
  const flowContainer = document.querySelector('.diagnostic-container');
  if (!flowContainer) return;

  const panels = document.querySelectorAll('.diag-panel');
  const stepIndicators = document.querySelectorAll('.step-indicator');
  const progressFill = document.getElementById('diag-progress-fill');
  const problemGrid = document.getElementById('problem-grid');

  // Estimate DOM Elements
  const estTitle = document.getElementById('est-title');
  const estPrice = document.getElementById('est-price');
  const estCategory = document.getElementById('est-category');
  const estInspection = document.getElementById('est-inspection');
  
  // Summary DOM Elements
  const sumDevice = document.getElementById('sum-device');
  const sumIssue = document.getElementById('sum-issue');
  const sumCondition = document.getElementById('sum-condition');
  const sumPrice = document.getElementById('sum-price');

  // Form DOM Elements
  const sysDevice = document.getElementById('sys-device');
  const sysIssue = document.getElementById('sys-issue');
  const sysCondition = document.getElementById('sys-condition');
  const bookingForm = document.getElementById('booking-form');
  const formSuccessState = document.getElementById('form-success-state');
  const formActionsRow = document.getElementById('form-actions-row');

  /**
   * Updates UI based on state object step.
   */
  const updateUI = () => {
    panels.forEach((panel, idx) => {
      panel.classList.toggle('active', idx + 1 === state.step);
    });

    stepIndicators.forEach((ind) => {
      const stepNum = parseInt(ind.dataset.step, 10);
      ind.classList.toggle('active', stepNum <= state.step);
    });
    
    if (progressFill) {
      progressFill.style.width = `${(state.step / 5) * 100}%`;
    }

    // Scroll to top of diag engine if moving forward
    if(state.step > 1) {
      const offset = flowContainer.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  /**
   * Populates the "Problem" grid dynamically with premium cards.
   */
  const populateIssues = (device) => {
    const issues = repairCategories[device] || repairCategories['other'];
    problemGrid.innerHTML = ''; 
    
    issues.forEach(issueObj => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'selector-card';
      btn.dataset.type = 'issue';
      btn.dataset.value = issueObj.id;
      btn.dataset.title = issueObj.title;

      btn.innerHTML = `
        <span class="card-icon" aria-hidden="true">${issueObj.icon}</span>
        <span class="card-title">${issueObj.title}</span>
        <span class="card-desc">${issueObj.desc}</span>
      `;

      btn.addEventListener('click', (e) => handleSelection(e, 'issue', issueObj.id));
      problemGrid.appendChild(btn);
    });
  };

  /**
   * Calculates indicative estimate and populates result/summary UI.
   */
  const calculateEstimate = () => {
    let priceRange = "Diagnostic Required";
    let category = "Hardware Assessment";
    let inspection = "In-person Review";

    const d = state.device || 'unknown';
    const i = state.issue || 'unknown';
    const c = state.condition || 'unknown';

    // Safe base indicative calculation logic
    if (i === 'display') {
      priceRange = d === 'iphone' ? "$129 – $289" : (d === 'tablet' ? "$149 – $349" : "$149 – $299");
      category = "Component Replacement";
      inspection = "Standard Diagnostic";
    } else if (i === 'battery') {
      priceRange = d === 'tablet' ? "$89 – $149" : "$69 – $109";
      category = "Power Delivery";
      inspection = "Battery Health Check";
    } else if (i === 'charging') {
      priceRange = "$59 – $119";
      category = "Port Maintenance/Replacement";
    } else if (i === 'water') {
      priceRange = "$99 – $199+";
      category = "Liquid Damage Protocol";
      inspection = "Extensive Teardown Required";
    } else if (i === 'software') {
      priceRange = "$39 – $89";
      category = "Software Restoration";
    }

    if (c === 'unresponsive' || c === 'dead') {
      priceRange = "TBD - Board Level Review";
      inspection = "Deep Component Analysis";
      category = "Advanced Diagnostics";
    }

    // Populate Estimate Panel
    if (estTitle) estTitle.textContent = `${d.toUpperCase()} // ${state.issueTitle ? state.issueTitle.toUpperCase() : i.toUpperCase()}`;
    if (estPrice) estPrice.textContent = priceRange;
    if (estCategory) estCategory.textContent = category;
    if (estInspection) estInspection.textContent = inspection;

    // Populate Summary Panel
    if (sumDevice) sumDevice.textContent = d;
    if (sumIssue) sumIssue.textContent = state.issueTitle || i;
    if (sumCondition) sumCondition.textContent = c;
    if (sumPrice) sumPrice.textContent = priceRange;

    // Prep hidden form fields safely
    if (sysDevice) sysDevice.value = d;
    if (sysIssue) sysIssue.value = i;
    if (sysCondition) sysCondition.value = c;
  };

  /**
   * Handles user interaction with diagnostic selection cards safely.
   */
  const handleSelection = (e, type, value) => {
    // Current target ensures we get the button even if internal span is clicked
    const targetBtn = e.currentTarget;
    const siblings = targetBtn.parentElement.querySelectorAll('.selector-card');
    siblings.forEach(btn => btn.classList.remove('selected'));
    targetBtn.classList.add('selected');

    // Update state
    state[type] = value;
    if (type === 'issue') {
      state.issueTitle = targetBtn.dataset.title || value;
    }

    setTimeout(() => {
      if (type === 'device') {
        populateIssues(value);
        state.step = 2;
      } else if (type === 'issue') {
        state.step = 3;
      } else if (type === 'condition') {
        calculateEstimate();
        state.step = 4;
      }
      updateUI();
    }, 300);
  };

  // Attach Listeners to Step 1 & 3 Static Cards
  document.querySelectorAll('.selector-card[data-type="device"], .selector-card[data-type="condition"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      handleSelection(e, e.currentTarget.dataset.type, e.currentTarget.dataset.value);
    });
  });

  // Attach Navigation Listeners
  document.querySelectorAll('.back-btn, .next-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetStep = parseInt(e.currentTarget.dataset.target, 10);
      if (targetStep && !isNaN(targetStep)) {
        state.step = targetStep;
        updateUI();
        
        // Reset form UI if navigating back to step 1 from success state
        if(targetStep === 1 && formSuccessState && !formSuccessState.classList.contains('hidden')) {
          resetFormUI();
        }
      }
    });
  });

  // Polished Form Validation & Submission
  const resetFormUI = () => {
    bookingForm.reset();
    formSuccessState.classList.add('hidden');
    bookingForm.querySelectorAll('.form-row, .field').forEach(el => el.style.display = 'block');
    if(formActionsRow) formActionsRow.style.display = 'flex';
  };

  if (bookingForm) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\+?[\d\s-]{7,15}$/;

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault(); 
      
      const contactField = bookingForm.elements.contact;
      const nameField = bookingForm.elements.name;
      let valid = true;

      // Validation
      [nameField, contactField].forEach(field => {
        if (field) {
          field.style.borderColor = 'rgba(255,255,255,0.15)';
          if (!field.value.trim()) {
            field.style.borderColor = '#ff4444';
            valid = false;
          }
        }
      });

      if (contactField) {
        const contactVal = contactField.value.trim();
        if (contactVal && !emailPattern.test(contactVal) && !phonePattern.test(contactVal)) {
          contactField.style.borderColor = '#ff4444';
          valid = false;
        }
      }

      if (!valid) return; 

      // Show Polished Success State (Frontend Concept)
      bookingForm.querySelectorAll('.form-row, .field').forEach(el => el.style.display = 'none');
      if(formActionsRow) formActionsRow.style.display = 'none';
      if(formSuccessState) formSuccessState.classList.remove('hidden');

      const status = bookingForm.querySelector('.form-status');
      if(status) status.textContent = ""; // Clear any previous errors

      // Optional: Prepare mailto link dynamically with data
      const mailtoBtn = formSuccessState.querySelector('a[href^="mailto:"]');
      if(mailtoBtn) {
        const subject = encodeURIComponent(`Diagnostic Request: ${state.device} - ${state.issueTitle}`);
        const body = encodeURIComponent(`Name: ${nameField.value}\nContact: ${contactField.value}\nDevice: ${state.device}\nIssue: ${state.issueTitle}\nCondition: ${state.condition}\n\nNotes: ${bookingForm.elements.description.value}`);
        mailtoBtn.href = `mailto:brobex.ffx@gmail.com?subject=${subject}&body=${body}`;
      }
    });

    const resetBtn = document.getElementById('reset-diag-btn');
    if(resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.step = 1;
        document.querySelectorAll('.selector-card').forEach(b => b.classList.remove('selected'));
        updateUI();
        resetFormUI();
      });
    }
  }

  // Performance Enhancement: Pause CSS Animations when off-screen
  const heroAnim = document.getElementById('hero-anim');
  if (heroAnim && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          heroAnim.classList.remove('paused');
        } else {
          heroAnim.classList.add('paused');
        }
      });
    }, { rootMargin: '50px' });
    observer.observe(heroAnim);
  }
})();