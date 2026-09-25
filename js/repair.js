(function () {
  'use strict';

  // Config: Repair Categories mapped to Devices
  const repairCategories = {
    iphone: ['Display', 'Battery', 'Charging', 'Camera', 'Speaker', 'Microphone', 'Buttons', 'Software', 'Water damage', 'Other'],
    android: ['Display', 'Battery', 'Charging', 'Camera', 'Speaker', 'Microphone', 'Buttons', 'Software', 'Water damage', 'Other'],
    tablet: ['Display', 'Battery', 'Charging', 'Software', 'Water damage', 'Other'],
    other: ['Display', 'Battery', 'Charging', 'Software', 'Water damage', 'Other']
  };

  // State Management
  const state = {
    step: 1,
    device: null,
    issue: null,
    condition: null
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

  // Form DOM Elements
  const sysDevice = document.getElementById('sys-device');
  const sysIssue = document.getElementById('sys-issue');

  /**
   * Updates the UI based on the current step in the state object.
   */
  const updateUI = () => {
    // Update Panels visibility
    panels.forEach((panel, idx) => {
      panel.classList.toggle('active', idx + 1 === state.step);
    });

    // Update HUD Progress Indicators
    stepIndicators.forEach((ind) => {
      const stepNum = parseInt(ind.dataset.step, 10);
      ind.classList.toggle('active', stepNum <= state.step);
    });
    
    // Update Progress Bar Fill
    if (progressFill) {
      progressFill.style.width = `${(state.step / 5) * 100}%`;
    }
  };

  /**
   * Populates the "Problem" grid dynamically based on the selected device.
   */
  const populateIssues = (device) => {
    const issues = repairCategories[device] || repairCategories['other'];
    problemGrid.innerHTML = ''; // Clear previous options
    
    issues.forEach(issue => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'selector-btn';
      btn.dataset.type = 'issue';
      btn.dataset.value = issue.toLowerCase();
      btn.textContent = issue;
      btn.addEventListener('click', (e) => handleSelection(e, 'issue', issue.toLowerCase()));
      problemGrid.appendChild(btn);
    });
  };

  /**
   * Calculates and populates the indicative estimate based on user selections.
   */
  const calculateEstimate = () => {
    let priceRange = "Diagnostic Required";
    let category = "Hardware Assessment";
    let inspection = "In-person Required";

    const d = state.device || 'Unknown';
    const i = state.issue || 'Unknown';

    if (i.includes('display')) {
      priceRange = d === 'iphone' ? "$129 – $189" : "$149 – $229";
      category = "Component Replacement";
      inspection = "Standard Diagnostic";
    } else if (i.includes('battery')) {
      priceRange = d === 'tablet' ? "$89 – $129" : "$59 – $89";
      category = "Power Delivery";
      inspection = "Battery Health Check";
    } else if (i.includes('charging')) {
      priceRange = "$49 – $99";
      category = "Port Maintenance/Replacement";
    } else if (i.includes('water')) {
      priceRange = "$99 – $169";
      category = "Liquid Damage Protocol";
      inspection = "Extensive Teardown Required";
    } else if (i.includes('software')) {
      priceRange = "$39 – $79";
      category = "Software Restoration";
    }

    if (state.condition === 'dead') {
      priceRange = "TBD - Board Level Review";
      inspection = "Deep Component Analysis";
    }

    // Assign to DOM elements
    if (estTitle) estTitle.textContent = `${d.toUpperCase()} / ${i.toUpperCase()}`;
    if (estPrice) estPrice.textContent = priceRange;
    if (estCategory) estCategory.textContent = category;
    if (estInspection) estInspection.textContent = inspection;

    // Prep hidden form fields for the booking step
    if (sysDevice) sysDevice.value = state.device;
    if (sysIssue) sysIssue.value = state.issue;
  };

  /**
   * Handles user interaction with diagnostic selection buttons.
   */
  const handleSelection = (e, type, value) => {
    // Visual toggle for selected button
    const siblings = e.target.parentElement.querySelectorAll('.selector-btn');
    siblings.forEach(btn => btn.classList.remove('selected'));
    e.target.classList.add('selected');

    // Update internal state
    state[type] = value;

    // Proceed to the next logical step with a slight delay for visual feedback
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
    }, 250);
  };

  // Attach Event Listeners to initial static grid buttons
  document.querySelectorAll('.selector-btn[data-type="device"], .selector-btn[data-type="condition"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.currentTarget.dataset.type;
      const value = e.currentTarget.dataset.value;
      handleSelection(e, type, value);
    });
  });

  // Attach Event Listeners for Back/Next navigation buttons
  document.querySelectorAll('.back-btn, .next-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetStep = parseInt(e.currentTarget.dataset.target, 10);
      if (targetStep && !isNaN(targetStep)) {
        state.step = targetStep;
        updateUI();
      }
    });
  });

  // Polished Form Validation Setup
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\+?[\d\s-]{7,15}$/; // Basic phone tolerance

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent standard submission for conceptual UI
      
      const contactField = bookingForm.elements.contact;
      const nameField = bookingForm.elements.name;
      let valid = true;

      // Reset styles and validate empty fields
      [nameField, contactField].forEach(field => {
        if (field) {
          field.style.borderColor = 'rgba(255,255,255,0.2)';
          if (!field.value.trim()) {
            field.style.borderColor = '#ff4444';
            valid = false;
          }
        }
      });

      // Validate Contact Format (Email or Phone)
      if (contactField) {
        const contactVal = contactField.value.trim();
        if (contactVal && !emailPattern.test(contactVal) && !phonePattern.test(contactVal)) {
          contactField.style.borderColor = '#ff4444';
          valid = false;
        }
      }

      if (!valid) return; // Halt if validation fails

      // Success Feedback mapping
      const status = bookingForm.querySelector('.form-status');
      if (status) {
        status.textContent = "Request mapped successfully. This frontend form is an interface concept — please email brobex.ffx@gmail.com to book your diagnostic.";
        status.style.color = "var(--brobex-green)";
        status.style.marginTop = "1rem";
        status.style.fontFamily = "var(--hud-font)";
      }
      
      // Cleanup
      bookingForm.reset();
      document.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('selected'));
    });
  }
})();