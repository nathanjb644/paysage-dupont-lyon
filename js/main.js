/**
 * Paysage Dupont Lyon — JavaScript principal
 * Vanilla JS uniquement (zero framework = vitesse maximale)
 *
 * Features:
 * - Burger menu mobile
 * - Slider avant/après interactif
 * - Cookie banner CNIL conforme + modal paramétrage
 * - Formulaire validation inline avec feedback visuel
 * - Smooth scroll
 * - Honeypot anti-spam
 * - Scroll reveal animations (IntersectionObserver)
 * - Gallery filtering
 */

(function () {
  'use strict';

  // ============================================
  // SCROLL REVEAL — IntersectionObserver
  // ============================================
  var revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show everything if no IntersectionObserver
    revealElements.forEach(function (el) {
      el.classList.add('reveal--visible');
    });
  }

  // ============================================
  // BURGER MENU
  // ============================================
  var burgerBtn = document.getElementById('burger-btn');
  var mobileNav = document.getElementById('mobile-nav');

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', function () {
      var isOpen = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isOpen);
      mobileNav.hidden = isOpen;
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Fermer au clic sur un lien
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burgerBtn.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
        document.body.style.overflow = '';
      });
    });
  }

  // ============================================
  // SLIDER AVANT/APRÈS
  // ============================================
  document.querySelectorAll('.projet-card__slider').forEach(function (slider) {
    var isDragging = false;
    var beforeEl = slider.querySelector('.projet-card__before');
    var handleEl = slider.querySelector('.projet-card__handle');

    function updatePosition(clientX) {
      var rect = slider.getBoundingClientRect();
      var x = clientX - rect.left;
      var percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      beforeEl.style.clipPath = 'inset(0 ' + (100 - percent) + '% 0 0)';
      handleEl.style.left = percent + '%';
    }

    // Mouse events
    slider.addEventListener('mousedown', function (e) {
      isDragging = true;
      updatePosition(e.clientX);
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (isDragging) updatePosition(e.clientX);
    });

    document.addEventListener('mouseup', function () {
      isDragging = false;
    });

    // Touch events
    slider.addEventListener('touchstart', function (e) {
      isDragging = true;
      updatePosition(e.touches[0].clientX);
    }, { passive: true });

    slider.addEventListener('touchmove', function (e) {
      if (isDragging) {
        updatePosition(e.touches[0].clientX);
        e.preventDefault();
      }
    }, { passive: false });

    slider.addEventListener('touchend', function () {
      isDragging = false;
    });
  });

  // ============================================
  // COOKIE BANNER + MODAL — CNIL 2026 CONFORME
  // 3 catégories : Essentiel (toujours), Analytique (consent), Marketing (consent)
  // ============================================
  var cookieBanner = document.getElementById('cookie-banner');
  var cookieAccept = document.getElementById('cookie-accept');
  var cookieRefuse = document.getElementById('cookie-refuse');
  var cookieParams = document.getElementById('cookie-params');
  var cookieModal = document.getElementById('cookie-modal');
  var footerCookieBtn = document.getElementById('footer-cookie-btn');

  function getCookieConsent() {
    try {
      var raw = localStorage.getItem('cookie_consent');
      if (!raw) return null;
      // Backward compat: old V1 stored plain strings like "accepted"/"refused"
      if (raw === 'accepted') return { essential: true, analytics: true, marketing: false };
      if (raw === 'refused') return { essential: true, analytics: false, marketing: false };
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function setCookieConsent(value) {
    try {
      var now = new Date().toISOString();
      localStorage.setItem('cookie_consent', JSON.stringify(value));
      localStorage.setItem('cookie_consent_date', now);

      // CNIL consent journal — log to Netlify hidden form
      logConsentToServer(value, now);

      // Load analytics if consent granted
      if (value.analytics) {
        loadClarity();
      }
    } catch (e) { /* Silently fail */ }
  }

  // ============================================
  // MICROSOFT CLARITY — Conditionné au consentement analytics
  // Remplacer XXXXXXXXXX par l'ID Clarity du projet
  // ============================================
  var clarityLoaded = false;
  function loadClarity() {
    if (clarityLoaded) return;
    clarityLoaded = true;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/XXXXXXXXXX";
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,"clarity","script");
  }

  // Auto-load Clarity si consentement déjà accordé (retour visiteur)
  try {
    var existingConsent = JSON.parse(localStorage.getItem('cookie_consent'));
    if (existingConsent && existingConsent.analytics) {
      loadClarity();
    }
  } catch (e) { /* No prior consent */ }

  // Send consent record to Netlify form for CNIL audit trail
  function logConsentToServer(consent, timestamp) {
    try {
      var body = new URLSearchParams();
      body.append('form-name', 'consent-journal');
      body.append('timestamp', timestamp);
      body.append('consent_essential', 'true');
      body.append('consent_analytics', consent.analytics ? 'true' : 'false');
      body.append('consent_marketing', consent.marketing ? 'true' : 'false');
      body.append('policy_version', '2026-04');
      body.append('consent_id', generateConsentId());

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      }).catch(function() { /* Silent — non-blocking */ });
    } catch (e) { /* Silent */ }
  }

  // Generate a pseudonymous consent ID (no PII)
  function generateConsentId() {
    try {
      var arr = new Uint8Array(8);
      crypto.getRandomValues(arr);
      return Array.from(arr, function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    } catch (e) {
      return 'fallback-' + Date.now().toString(36);
    }
  }

  function hideBanner() { if (cookieBanner) { cookieBanner.hidden = true; cookieBanner.style.display = 'none'; } }
  function showBanner() { if (cookieBanner) { cookieBanner.hidden = false; cookieBanner.style.display = ''; } }
  function hideModal() { if (cookieModal) { cookieModal.hidden = true; cookieModal.style.display = 'none'; } }
  function showModal() { if (cookieModal) { cookieModal.hidden = false; cookieModal.style.display = ''; } }

  function isConsentValid() {
    try {
      var date = localStorage.getItem('cookie_consent_date');
      if (!date) return false;
      var diff = Date.now() - new Date(date).getTime();
      return diff < 13 * 30 * 24 * 60 * 60 * 1000; // 13 mois CNIL
    } catch (e) { return false; }
  }

  // Init
  var consent = getCookieConsent();
  if (consent && isConsentValid()) {
    hideBanner();
    if (consent.analytics) { /* loadAnalytics(); */ }
  } else {
    showBanner();
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', function () {
      setCookieConsent({ essential: true, analytics: true, marketing: false });
      hideBanner();
      hideModal();
    });
  }

  if (cookieRefuse) {
    cookieRefuse.addEventListener('click', function () {
      setCookieConsent({ essential: true, analytics: false, marketing: false });
      hideBanner();
      hideModal();
    });
  }

  // Ouvrir le modal de paramétrage
  if (cookieParams) {
    cookieParams.addEventListener('click', function () {
      hideBanner();
      showModal();
    });
  }

  // Toggles dans le modal
  if (cookieModal) {
    var toggles = cookieModal.querySelectorAll('.cookie-toggle:not(.cookie-toggle--disabled)');
    toggles.forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        this.classList.toggle('cookie-toggle--active');
      });
    });

    // Bouton sauvegarder dans le modal
    var saveBtn = cookieModal.querySelector('#cookie-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var analyticsToggle = cookieModal.querySelector('[data-category="analytics"]');
        setCookieConsent({
          essential: true,
          analytics: analyticsToggle ? analyticsToggle.classList.contains('cookie-toggle--active') : false,
          marketing: false
        });
        hideModal();
      });
    }

    // Fermer le modal
    var closeBtn = cookieModal.querySelector('#cookie-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        hideModal();
        showBanner();
      });
    }
  }

  // Réouverture depuis le footer
  if (footerCookieBtn) {
    footerCookieBtn.addEventListener('click', function (e) {
      e.preventDefault();
      showModal();
    });
  }

  // ============================================
  // FORMULAIRE — Validation inline + Honeypot + Feedback visuel
  // ============================================
  var form = document.getElementById('devis-form');
  if (form) {
    // Pré-remplir service depuis URL
    var params = new URLSearchParams(window.location.search);
    var serviceParam = params.get('service');
    var serviceSelect = form.querySelector('[name="service"]');
    if (serviceParam && serviceSelect) {
      serviceSelect.value = serviceParam;
    }

    // Validation inline
    form.querySelectorAll('input, select').forEach(function (field) {
      field.addEventListener('blur', function () {
        validateField(this);
      });
    });

    form.addEventListener('submit', function (e) {
      // Check honeypot
      var honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value !== '') {
        e.preventDefault();
        return;
      }

      // Validate all
      var isValid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) {
        e.preventDefault();
        var firstError = form.querySelector('.field--error input, .field--error select');
        if (firstError) firstError.focus();
      }
    });
  }

  function validateField(field) {
    var parent = field.closest('.field');
    if (!parent) return true;

    var errorEl = parent.querySelector('.field__error');
    var value = field.value.trim();
    var isValid = true;
    var message = '';

    if (field.required && !value) {
      isValid = false;
      message = 'Ce champ est requis';
    } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      isValid = false;
      message = 'Adresse email invalide';
    } else if (field.type === 'tel' && value && !/^[\d\s+()-]{10,}$/.test(value)) {
      isValid = false;
      message = 'Numéro de téléphone invalide';
    }

    parent.classList.toggle('field--error', !isValid);
    parent.classList.toggle('field--valid', isValid && !!value);
    if (errorEl) errorEl.textContent = message;

    return isValid;
  }

  // ============================================
  // GALLERY FILTERING
  // ============================================
  var filterBtns = document.querySelectorAll('.gallery-filter');
  var galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = this.getAttribute('data-filter');

        // Active state
        filterBtns.forEach(function (b) { b.classList.remove('gallery-filter--active'); });
        this.classList.add('gallery-filter--active');

        // Filter items
        galleryItems.forEach(function (item) {
          if (filter === 'all' || item.getAttribute('data-type') === filter) {
            item.classList.remove('gallery-item--hidden');
          } else {
            item.classList.add('gallery-item--hidden');
          }
        });
      });
    });
  }

  // ============================================
  // LOGO CLICK — scroll to top instead of page reload
  // Prevents cookie banner flash on homepage
  // ============================================
  var logoLink = document.querySelector('.header__logo');
  if (logoLink && (logoLink.getAttribute('href') === '/' || logoLink.getAttribute('href') === '/index.html')) {
    logoLink.addEventListener('click', function (e) {
      // Only intercept if we're already on the homepage
      if (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/template-paysagiste/')) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ============================================
  // SMOOTH SCROLL pour les ancres
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var headerHeight = document.querySelector('.header') ? document.querySelector('.header').offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // SCROLL SPY — active nav link indicator
  // ============================================
  var navLinks = document.querySelectorAll('.header__nav-list a[href^="#"]');
  var sections = [];
  navLinks.forEach(function (link) {
    var target = document.querySelector(link.getAttribute('href'));
    if (target) sections.push({ el: target, link: link });
  });

  if (sections.length > 0) {
    var scrollSpyUpdate = function () {
      var scrollPos = window.pageYOffset;
      var headerH = document.querySelector('.header') ? document.querySelector('.header').offsetHeight : 0;
      var current = null;

      sections.forEach(function (s) {
        if (s.el.offsetTop - headerH - 100 <= scrollPos) {
          current = s;
        }
      });

      navLinks.forEach(function (link) { link.classList.remove('is-active'); });
      if (current) current.link.classList.add('is-active');
    };

    var scrollSpyThrottle = null;
    window.addEventListener('scroll', function () {
      if (!scrollSpyThrottle) {
        scrollSpyThrottle = requestAnimationFrame(function () {
          scrollSpyUpdate();
          scrollSpyThrottle = null;
        });
      }
    }, { passive: true });
    scrollSpyUpdate();
  }

})();
