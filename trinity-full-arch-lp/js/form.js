/**
 * Trinity Dental Arts - Full-Arch Landing Page
 * Multi-Step Form Handler
 */

// Form Configuration
const FORM_CONFIG = {
  totalSteps: 16,
  customerId: 'eefc9382-2543-4058-af96-6ad00702dc4d',
  siteId: 'PENDING_URL', // Update when URL is assigned
  submissionEndpoint: 'https://analytics.gomega.ai/submission/submit'
};

// Current step tracker
let currentStep = 1;

// Initialize form on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeForm();
  populateHiddenFields();
});

/**
 * Initialize form functionality
 */
function initializeForm() {
  const form = document.getElementById('qualification-form');

  if (form) {
    // Auto-advance on radio selection
    const radioInputs = form.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => {
      input.addEventListener('change', function() {
        // Small delay for visual feedback
        setTimeout(() => {
          if (currentStep < FORM_CONFIG.totalSteps) {
            nextStep();
          }
        }, 300);
      });
    });

    // Form submission handler
    form.addEventListener('submit', handleFormSubmit);
  }

  // Update progress bar
  updateProgressBar();
}

/**
 * Navigate to next step
 */
function nextStep() {
  const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);

  // Validate current step
  if (!validateStep(currentStep)) {
    return;
  }

  // Hide current step
  currentStepElement.classList.remove('active');

  // Move to next step
  currentStep++;

  // Show next step
  const nextStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  if (nextStepElement) {
    nextStepElement.classList.add('active');
  }

  // Update progress bar
  updateProgressBar();

  // Track step progression
  trackStepProgression(currentStep);

  // Scroll form into view on mobile
  scrollFormIntoView();
}

/**
 * Navigate to previous step
 */
function prevStep() {
  if (currentStep <= 1) return;

  const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  currentStepElement.classList.remove('active');

  currentStep--;

  const prevStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  if (prevStepElement) {
    prevStepElement.classList.add('active');
  }

  updateProgressBar();
  scrollFormIntoView();
}

/**
 * Validate current step
 */
function validateStep(step) {
  const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
  const requiredInputs = stepElement.querySelectorAll('input[required], select[required]');

  let isValid = true;

  requiredInputs.forEach(input => {
    if (input.type === 'radio') {
      const radioGroup = stepElement.querySelectorAll(`input[name="${input.name}"]`);
      const isChecked = Array.from(radioGroup).some(radio => radio.checked);

      if (!isChecked) {
        isValid = false;
        highlightError(radioGroup[0].closest('.radio-group'));
      }
    } else if (input.type === 'checkbox') {
      if (!input.checked) {
        isValid = false;
        highlightError(input.closest('.checkbox-group'));
      }
    } else {
      if (!input.value.trim()) {
        isValid = false;
        highlightError(input);
      } else if (input.type === 'email' && !isValidEmail(input.value)) {
        isValid = false;
        highlightError(input);
      } else if (input.type === 'tel' && !isValidPhone(input.value)) {
        isValid = false;
        highlightError(input);
      }
    }
  });

  return isValid;
}

/**
 * Highlight error on invalid input
 */
function highlightError(element) {
  element.classList.add('error');

  setTimeout(() => {
    element.classList.remove('error');
  }, 2000);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format
 */
function isValidPhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Update progress bar
 */
function updateProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const progress = (currentStep / FORM_CONFIG.totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
  }
}

/**
 * Scroll form into view (for mobile)
 */
function scrollFormIntoView() {
  if (window.innerWidth <= 768) {
    const formCard = document.querySelector('.form-card');
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  // Validate final step
  if (!validateStep(currentStep)) {
    return;
  }

  const form = event.target;
  const submitBtn = form.querySelector('.btn-submit');

  // Show loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  // Collect all form data
  const formData = collectFormData(form);

  try {
    // Submit to MegaTag Analytics
    await submitToMegaTag(formData);

    // Submit to HighLevel (GHL)
    await submitToHighLevel(formData);

    // Show success message
    showSuccessMessage(form);

    // Track conversion
    trackConversion(formData);

  } catch (error) {
    console.error('Form submission error:', error);

    // Reset button state
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    submitBtn.textContent = 'SUBMIT';

    // Show error message
    alert('There was an error submitting your form. Please try again or call us directly.');
  }
}

/**
 * Collect all form data
 */
function collectFormData(form) {
  const formData = new FormData(form);
  const data = {};

  // Convert FormData to object
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  // Add metadata
  data.submitted_at = new Date().toISOString();
  data.customer_id = FORM_CONFIG.customerId;
  data.site_id = FORM_CONFIG.siteId;
  data.page_url = window.location.href;
  data.referrer_url = document.referrer;

  // Add session/visitor IDs from tracking
  data.session_id = getSessionId();
  data.visitor_id = getVisitorId();

  // Add UTM parameters
  const urlParams = new URLSearchParams(window.location.search);
  data.utm_source = urlParams.get('utm_source') || '';
  data.utm_medium = urlParams.get('utm_medium') || '';
  data.utm_campaign = urlParams.get('utm_campaign') || '';
  data.utm_term = urlParams.get('utm_term') || '';
  data.utm_content = urlParams.get('utm_content') || '';

  // Add click IDs
  data.gclid = urlParams.get('gclid') || '';
  data.gbraid = urlParams.get('gbraid') || '';
  data.wbraid = urlParams.get('wbraid') || '';
  data.fbclid = urlParams.get('fbclid') || '';

  // Add Meta tracking fields
  data.fbp = getCookie('_fbp') || '';
  data.fbc = getCookie('_fbc') || '';

  return data;
}

/**
 * Submit to MegaTag Analytics endpoint
 */
async function submitToMegaTag(data) {
  const payload = {
    customer_id: data.customer_id,
    site_id: data.site_id,
    form_data: data,
    page_url: data.page_url,
    referrer_url: data.referrer_url,
    session_id: data.session_id,
    visitor_id: data.visitor_id,
    utm_source: data.utm_source,
    utm_medium: data.utm_medium,
    utm_campaign: data.utm_campaign,
    utm_term: data.utm_term,
    utm_content: data.utm_content,
    gclid: data.gclid,
    gbraid: data.gbraid,
    wbraid: data.wbraid,
    fbclid: data.fbclid,
    fbp: data.fbp,
    fbc: data.fbc
  };

  const response = await fetch(FORM_CONFIG.submissionEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('MegaTag submission failed');
  }

  return response.json();
}

/**
 * Submit to HighLevel (GHL) webhook
 */
async function submitToHighLevel(data) {
  // HighLevel webhook URL - to be configured
  const ghlWebhookUrl = 'https://services.leadconnectorhq.com/hooks/WEBHOOK_ID';

  // This will be configured based on the actual GHL setup
  // For now, we'll rely on the MegaTag integration to push to GHL
  console.log('GHL submission data:', data);
}

/**
 * Show success message
 */
function showSuccessMessage(form) {
  const formCard = form.closest('.form-card');

  formCard.innerHTML = `
    <div class="form-success">
      <div style="font-size: 60px; margin-bottom: 20px;">✓</div>
      <h3>Thank You!</h3>
      <p>Your information has been received. Our team will contact you shortly to schedule your complimentary consultation.</p>
      <p style="margin-top: 15px; font-weight: 600;">We look forward to helping you transform your smile!</p>
    </div>
  `;
}

/**
 * Populate hidden fields with tracking data
 */
function populateHiddenFields() {
  const urlParams = new URLSearchParams(window.location.search);

  // Set page and referrer URLs
  setFieldValue('page_url', window.location.href);
  setFieldValue('referrer_url', document.referrer);

  // Set UTM parameters
  setFieldValue('utm_source', urlParams.get('utm_source'));
  setFieldValue('utm_medium', urlParams.get('utm_medium'));
  setFieldValue('utm_campaign', urlParams.get('utm_campaign'));
  setFieldValue('utm_term', urlParams.get('utm_term'));
  setFieldValue('utm_content', urlParams.get('utm_content'));

  // Set click IDs
  setFieldValue('gclid', urlParams.get('gclid'));
  setFieldValue('gbraid', urlParams.get('gbraid'));
  setFieldValue('wbraid', urlParams.get('wbraid'));
  setFieldValue('fbclid', urlParams.get('fbclid'));

  // Set session and visitor IDs
  setFieldValue('session_id', getSessionId());
  setFieldValue('visitor_id', getVisitorId());
}

/**
 * Helper to set field value
 */
function setFieldValue(fieldId, value) {
  const field = document.getElementById(fieldId);
  if (field && value) {
    field.value = value;
  }
}

/**
 * Get or create session ID
 */
function getSessionId() {
  let sessionId = sessionStorage.getItem('tda_session_id');

  if (!sessionId) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('tda_session_id', sessionId);
  }

  return sessionId;
}

/**
 * Get or create visitor ID
 */
function getVisitorId() {
  let visitorId = localStorage.getItem('tda_visitor_id');

  if (!visitorId) {
    visitorId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('tda_visitor_id', visitorId);
  }

  return visitorId;
}

/**
 * Get cookie value by name
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

/**
 * Track step progression for analytics
 */
function trackStepProgression(step) {
  // Push to dataLayer for GTM
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'form_step_completion',
      form_name: 'dental_implant_quiz',
      step_number: step,
      step_name: getStepName(step)
    });
  }
}

/**
 * Get step name for tracking
 */
function getStepName(step) {
  const stepNames = {
    1: 'teeth_count',
    2: 'age',
    3: 'current_solution',
    4: 'missing_teeth_duration',
    5: 'eating_difficulty',
    6: 'pain_discomfort',
    7: 'confidence_boost',
    8: 'discussed_with_dentist',
    9: 'readiness',
    10: 'payment_plan_interest',
    11: 'budget_qualifier',
    12: 'credit_situation',
    13: 'cosigner',
    14: 'funding_resources',
    15: 'monthly_income',
    16: 'contact_info'
  };
  return stepNames[step] || `step_${step}`;
}

/**
 * Track form conversion
 */
function trackConversion(data) {
  // Push conversion event to dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'form_submission',
      form_name: 'dental_implant_quiz',
      budget_qualified: data.budget_qualifier === 'Yes, I am comfortable with this investment',
      teeth_count: data.teeth_count,
      age_range: data.age
    });
  }

  // Facebook Pixel conversion (if available)
  if (window.fbq) {
    fbq('track', 'Lead', {
      content_name: 'Full-Arch Dental Implant Quiz',
      content_category: 'Dental Implants'
    });
  }

  // Google Ads conversion (if available)
  if (window.gtag) {
    gtag('event', 'conversion', {
      send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL'
    });
  }
}

// Expose functions globally
window.nextStep = nextStep;
window.prevStep = prevStep;
