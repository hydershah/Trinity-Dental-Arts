/**
 * Trinity Dental Arts - Full-Arch Landing Page
 * Tracking & Attribution Scripts
 */

// MegaTag Configuration
window.MEGA_TAG_CONFIG = {
  siteKey: 'sk_mkh60p43_31e1k5myxx8',
  siteId: '893c5bc3-1820-4976-acc1-70cb104f6e3a',
  gtmId: 'GTM-KL2XMJK3',
  gaId: null, // Add GA4 ID if available
  pixelId: null, // Add Meta Pixel ID if available
  apiEndpoints: {
    submission: 'https://analytics.gomega.ai/submission/submit',
    tracking: 'https://analytics.gomega.ai/track'
  }
};

// Initialize tracking on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeMegaTag();
  initializeCallTracking();
  trackPageView();
  setupScrollTracking();
  setupClickTracking();
});

/**
 * Initialize MegaTag tracking
 */
function initializeMegaTag() {
  // Create MegaTag object if it doesn't exist
  window.MegaTag = window.MegaTag || {};

  // Store visitor and session information
  window.MegaTag.visitor = {
    id: getVisitorId(),
    session_id: getSessionId(),
    first_visit: isFirstVisit(),
    landing_page: window.location.href,
    referrer: document.referrer,
    user_agent: navigator.userAgent
  };

  // Parse and store UTM parameters
  window.MegaTag.attribution = parseAttributionParams();

  // Log initialization
  console.log('MegaTag initialized:', window.MegaTag);
}

/**
 * Parse attribution parameters from URL
 */
function parseAttributionParams() {
  const urlParams = new URLSearchParams(window.location.search);

  return {
    utm_source: urlParams.get('utm_source') || '',
    utm_medium: urlParams.get('utm_medium') || '',
    utm_campaign: urlParams.get('utm_campaign') || '',
    utm_term: urlParams.get('utm_term') || '',
    utm_content: urlParams.get('utm_content') || '',
    gclid: urlParams.get('gclid') || '',
    gbraid: urlParams.get('gbraid') || '',
    wbraid: urlParams.get('wbraid') || '',
    fbclid: urlParams.get('fbclid') || '',
    msclkid: urlParams.get('msclkid') || '',
    fbp: getCookie('_fbp') || '',
    fbc: getCookie('_fbc') || ''
  };
}

/**
 * Check if this is user's first visit
 */
function isFirstVisit() {
  const visited = localStorage.getItem('tda_visited');
  if (!visited) {
    localStorage.setItem('tda_visited', Date.now());
    return true;
  }
  return false;
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
 * Get cookie value
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

/**
 * Initialize CallTrackingMetrics (CTM) for Dynamic Number Insertion
 */
function initializeCallTracking() {
  // CTM script loader
  (function() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = '//cdn.calltrackingmetrics.com/js/v3/ctm.min.js';

    script.onload = function() {
      // CTM configuration
      if (window.__ctm) {
        window.__ctm.tracking = window.__ctm.tracking || [];

        // Configure CTM with source tracking
        window.__ctm.tracking.push({
          // Add CTM account configuration here
          // source: urlParams based tracking
        });
      }
    };

    document.head.appendChild(script);
  })();

  // Handle phone number click tracking
  document.querySelectorAll('a[href^="tel:"]').forEach(function(phoneLink) {
    phoneLink.addEventListener('click', function() {
      trackPhoneClick(this.href);
    });
  });
}

/**
 * Track phone click event
 */
function trackPhoneClick(phoneNumber) {
  // Push to dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'phone_click',
      phone_number: phoneNumber,
      page_location: window.location.href
    });
  }

  // Track with MegaTag
  sendTrackingEvent('phone_click', {
    phone_number: phoneNumber,
    timestamp: new Date().toISOString()
  });
}

/**
 * Track page view
 */
function trackPageView() {
  // Push to dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname
    });
  }

  // Track with MegaTag
  sendTrackingEvent('page_view', {
    page_title: document.title,
    page_url: window.location.href,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  });
}

/**
 * Setup scroll depth tracking
 */
function setupScrollTracking() {
  const scrollMarks = [25, 50, 75, 90];
  const marksReached = new Set();

  window.addEventListener('scroll', function() {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    scrollMarks.forEach(function(mark) {
      if (scrollPercent >= mark && !marksReached.has(mark)) {
        marksReached.add(mark);
        trackScrollDepth(mark);
      }
    });
  });
}

/**
 * Track scroll depth event
 */
function trackScrollDepth(depth) {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'scroll_depth',
      scroll_percentage: depth
    });
  }
}

/**
 * Setup CTA click tracking
 */
function setupClickTracking() {
  // Track all CTA button clicks
  document.querySelectorAll('.primary-cta, .secondary-cta, .nav-btn, .hero-cta-btn, .service-cta').forEach(function(cta) {
    cta.addEventListener('click', function() {
      trackCtaClick(this);
    });
  });

  // Track anchor link clicks
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function() {
      trackAnchorClick(this.getAttribute('href'));
    });
  });
}

/**
 * Track CTA click
 */
function trackCtaClick(element) {
  const ctaText = element.textContent.trim();
  const ctaHref = element.getAttribute('href') || '';

  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'cta_click',
      cta_text: ctaText,
      cta_destination: ctaHref,
      cta_location: getElementSection(element)
    });
  }
}

/**
 * Track anchor link click
 */
function trackAnchorClick(anchor) {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'anchor_click',
      anchor_target: anchor
    });
  }
}

/**
 * Get the section an element belongs to
 */
function getElementSection(element) {
  const section = element.closest('section');
  if (section) {
    return section.id || section.className.split(' ')[0];
  }
  return 'unknown';
}

/**
 * Send tracking event to MegaTag
 */
async function sendTrackingEvent(eventName, eventData) {
  try {
    const payload = {
      event: eventName,
      data: eventData,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      site_key: window.MEGA_TAG_CONFIG.siteKey,
      attribution: window.MegaTag?.attribution || {},
      timestamp: new Date().toISOString()
    };

    // Send to tracking endpoint (non-blocking)
    fetch(window.MEGA_TAG_CONFIG.apiEndpoints.tracking, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function(error) {
      console.warn('Tracking event failed:', error);
    });
  } catch (error) {
    console.warn('Error sending tracking event:', error);
  }
}

/**
 * Store attribution data in session for form submission
 */
function storeAttributionForForm() {
  const attribution = window.MegaTag?.attribution || {};
  sessionStorage.setItem('tda_attribution', JSON.stringify(attribution));
}

/**
 * Get stored attribution data
 */
function getStoredAttribution() {
  const stored = sessionStorage.getItem('tda_attribution');
  return stored ? JSON.parse(stored) : {};
}

// Store attribution data
storeAttributionForForm();

// Expose functions globally
window.trackPhoneClick = trackPhoneClick;
window.sendTrackingEvent = sendTrackingEvent;
window.getStoredAttribution = getStoredAttribution;
