/**
 * BROBEX Ultra-Premium Interactive Contact & Multi-Step Intake Engine
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initContactExperience);

  function initContactExperience() {
    const intakeForm = document.getElementById('intake-form');
    if (!intakeForm) return;

    // State object
    const intakeState = {
      currentStep: 1,
      totalSteps: 5,
      data: {
        need: '',
        stage: '',
        timeline: '',
        budget: '',
        name: '',
        email: '',
        message: ''
      }
    };

    // DOM Elements
    const stepPanels = document.querySelectorAll('[data-step-panel]');
    const stepNodes = document.querySelectorAll('.step-node');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressBarTrack = document.getElementById('intake-progress-bar');
    const stepBadge = document.getElementById('step-badge');
    const stepTitleDisplay = document.getElementById('step-title-display');
    const successScreen = document.getElementById('success-screen');

    // Step Titles
    const stepTitles = {
      1: 'What do you need?',
      2: 'What is the project stage?',
      3: 'Timeline',
      4: 'Estimated Budget',
      5: 'Project Details & Review'
    };

    // Sync input radio & text values into state
    intakeForm.addEventListener('change', (e) => {
      const target = e.target;
      if (target.name && intakeState.data.hasOwnProperty(target.name)) {
        intakeState.data[target.name] = target.value.trim();
        clearError(target.name);
        updateSummaryPanel();
      }
    });

    intakeForm.addEventListener('input', (e) => {
      const target = e.target;
      if (target.name && ['name', 'email', 'message'].includes(target.name)) {
        intakeState.data[target.name] = target.value.trim();
        clearError(target.name);
      }
    });

    // Navigation Buttons
    prevBtn?.addEventListener('click', () => {
      if (intakeState.currentStep > 1) {
        goToStep(intakeState.currentStep - 1);
      }
    });

    nextBtn?.addEventListener('click', () => {
      if (validateStep(intakeState.currentStep)) {
        if (intakeState.currentStep < intakeState.totalSteps) {
          goToStep(intakeState.currentStep + 1);
        }
      }
    });

    // Edit Buttons in Summary Panel
    document.querySelectorAll('[data-goto-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetStep = Number(btn.getAttribute('data-goto-step'));
        if (targetStep >= 1 && targetStep <= intakeState.totalSteps) {
          goToStep(targetStep);
        }
      });
    });

    // Header Node Clicks
    stepNodes.forEach((node) => {
      node.querySelector('button')?.addEventListener('click', () => {
        const stepNum = Number(node.getAttribute('data-step'));
        // Allow backwards navigation or forward if previous steps valid
        if (stepNum < intakeState.currentStep) {
          goToStep(stepNum);
        } else if (stepNum > intakeState.currentStep) {
          if (validateStep(intakeState.currentStep)) {
            goToStep(stepNum);
          }
        }
      });
    });

    // Step Transition Handler
    function goToStep(step) {
      intakeState.currentStep = step;

      // Update Panels
      stepPanels.forEach((panel) => {
        const isCurrent = Number(panel.getAttribute('data-step-panel')) === step;
        panel.classList.toggle('active', isCurrent);
      });

      // Update Step Indicators
      stepNodes.forEach((node) => {
        const nodeStep = Number(node.getAttribute('data-step'));
        node.classList.toggle('active', nodeStep === step);
        node.classList.toggle('completed', nodeStep < step);
      });

      // Update Progress Bar
      const percentage = (step / intakeState.totalSteps) * 100;
      if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
      if (progressBarTrack) progressBarTrack.setAttribute('aria-valuenow', String(step));

      // Update Header Text
      if (stepBadge) stepBadge.textContent = `STEP 0${step} / 0${intakeState.totalSteps}`;
      if (stepTitleDisplay) stepTitleDisplay.textContent = stepTitles[step] || '';

      // Button States
      if (prevBtn) prevBtn.disabled = step === 1;

      if (step === intakeState.totalSteps) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'inline-flex';
        updateSummaryPanel();
      } else {
        if (nextBtn) {
          nextBtn.style.display = 'inline-flex';
          nextBtn.querySelector('span').textContent = `Continue Step 0${step + 1} →`;
        }
        if (submitBtn) submitBtn.style.display = 'none';
      }

      // Scroll smoothly to intake container top
      const container = document.querySelector('.intake-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        if (rect.top < 0) {
          window.scrollTo({ top: window.scrollY + rect.top - 100, behavior: 'smooth' });
        }
      }
    }

    // Step Validation
    function validateStep(step) {
      let valid = true;

      if (step === 1) {
        if (!intakeState.data.need) {
          showError('step-1', 'Please select what service or project type you need.');
          valid = false;
        } else {
          clearError('step-1');
        }
      } else if (step === 2) {
        if (!intakeState.data.stage) {
          showError('step-2', 'Please select your current project stage.');
          valid = false;
        } else {
          clearError('step-2');
        }
      } else if (step === 3) {
        if (!intakeState.data.timeline) {
          showError('step-3', 'Please select an estimated project timeline.');
          valid = false;
        } else {
          clearError('step-3');
        }
      } else if (step === 4) {
        if (!intakeState.data.budget) {
          showError('step-4', 'Please select a budget range starter.');
          valid = false;
        } else {
          clearError('step-4');
        }
      } else if (step === 5) {
        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const messageInput = document.getElementById('contact-message');

        if (!nameInput?.value.trim()) {
          showError('name', 'Please enter your name.');
          valid = false;
        } else {
          clearError('name');
        }

        if (!emailInput?.value.trim() || !validateEmail(emailInput.value.trim())) {
          showError('email', 'Please enter a valid email address.');
          valid = false;
        } else {
          clearError('email');
        }

        if (!messageInput?.value.trim()) {
          showError('message', 'Please provide a brief description of your request.');
          valid = false;
        } else {
          clearError('message');
        }
      }

      return valid;
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(fieldKey, message) {
      const errEl = document.getElementById(`error-${fieldKey}`);
      if (errEl) errEl.textContent = message;
    }

    function clearError(fieldKey) {
      const errEl = document.getElementById(`error-${fieldKey}`);
      if (errEl) errEl.textContent = '';
      const stepErrEl = document.getElementById(`error-step-${fieldKey}`);
      if (stepErrEl) stepErrEl.textContent = '';
    }

    // Update Summary Panel in Step 05
    function updateSummaryPanel() {
      const elType = document.getElementById('summary-type');
      const elStage = document.getElementById('summary-stage');
      const elTimeline = document.getElementById('summary-timeline');
      const elBudget = document.getElementById('summary-budget');

      if (elType) elType.textContent = intakeState.data.need || 'Not selected';
      if (elStage) elStage.textContent = intakeState.data.stage || 'Not selected';
      if (elTimeline) elTimeline.textContent = intakeState.data.timeline || 'Not selected';
      if (elBudget) elBudget.textContent = intakeState.data.budget || 'Not selected';
    }

    // Form Submission & Success State Setup
    intakeForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateStep(5)) return;

      // Generate formatted message block
      const formattedMessage =
`BROBEX PROJECT INQUIRY SUMMARY
================================
Client Name:    ${intakeState.data.name}
Client Email:   ${intakeState.data.email}

PROJECT SCOPE
-------------
Service Need:   ${intakeState.data.need}
Current Stage:  ${intakeState.data.stage}
Timeline:       ${intakeState.data.timeline}
Budget Starter: ${intakeState.data.budget}

DETAILS & MESSAGE
-----------------
${intakeState.data.message}
================================`;

      // Set Recap text
      const recapTextEl = document.getElementById('recap-text');
      if (recapTextEl) recapTextEl.textContent = formattedMessage;

      // Construct mailto link
      const mailtoBtn = document.getElementById('mailto-direct-btn');
      if (mailtoBtn) {
        const subject = encodeURIComponent(`Project Inquiry: ${intakeState.data.need} - ${intakeState.data.name}`);
        const body = encodeURIComponent(formattedMessage);
        mailtoBtn.href = `mailto:brobex.ffx@gmail.com?subject=${subject}&body=${body}`;
      }

      // Hide Form, Show Success Screen
      intakeForm.style.display = 'none';
      const headerBlock = document.querySelector('.intake-header');
      if (headerBlock) headerBlock.style.display = 'none';

      if (successScreen) {
        successScreen.style.display = 'block';
        successScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // Copy Summary Button
    const copyBtn = document.getElementById('copy-summary-btn');
    copyBtn?.addEventListener('click', () => {
      const textToCopy = document.getElementById('recap-text')?.textContent;
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const btnSpan = copyBtn.querySelector('span');
          if (btnSpan) {
            const orig = btnSpan.textContent;
            btnSpan.textContent = '✓ Summary Copied!';
            setTimeout(() => { btnSpan.textContent = orig; }, 2500);
          }
        }).catch(() => {
          alert('Copy failed. Please manually select and copy the preview text.');
        });
      }
    });

    // FAQ Accordion Handler
    const faqTriggers = document.querySelectorAll('.faq-trigger');
    faqTriggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        const contentId = trigger.getAttribute('aria-controls');
        const content = document.getElementById(contentId);

        // Close other FAQs
        faqTriggers.forEach((other) => {
          if (other !== trigger) {
            other.setAttribute('aria-expanded', 'false');
            const otherId = other.getAttribute('aria-controls');
            const otherContent = document.getElementById(otherId);
            if (otherContent) otherContent.hidden = true;
          }
        });

        trigger.setAttribute('aria-expanded', String(!expanded));
        if (content) content.hidden = expanded;
      });
    });
  }
})();