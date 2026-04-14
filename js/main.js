/**
 * Paysage Dupont Lyon — JavaScript principal
 * Vanilla JS uniquement (zero framework = vitesse maximale)
 *
 * Features:
 * - Burger menu mobile
 * - Slider avant/après interactif
 * - Cookie banner CNIL conforme
 * - Formulaire validation inline
 * - Smooth scroll
 * - Honeypot anti-spam
 */

(function () {
  'use strict';

  // ============================================
  // BURGER MENU
  // ============================================
  const burgerBtn = document.getElementById('burger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', function () {
      const isOpen = this.getAttribute('aria-expanded') === 'true';
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
  // COOKIE BANNER — CNIL 2026 CONFORME
  // Aucun cookie non-essentiel avant consentement
  // ============================================
  var cookieBanner = document.getElementById('cookie-banner');
  var cookieAccept = document.getElementById('cookie-accept');
  var cookieRefuse = document.getElementById('cookie-refuse');
  var cookieParams = document.getElementById('cookie-params');
  var footerCookieBtn = document.getElementById('footer-cookie-btn');

  function getCookieConsent() {
    try {
      return localStorage.getItem('cookie_consent');
    } catch (e) {
      return null;
    }
  }

  function setCookieConsent(value) {
    try {
      localStorage.setItem('cookie_consent', value);
      localStorage.setItem('cookie_consent_date', new Date().toISOString());
    } catch (e) {
      // Silently fail
    }
  }

  function hideBanner() {
    if (cookieBanner) cookieBanner.hidden = true;
  }

  function showBanner() {
    if (cookieBanner) cookieBanner.hidden = false;
  }

  // Vérifier consentement existant (max 13 mois — CNIL)
  function isConsentValid() {
    try {
      var date = localStorage.getItem('cookie_consent_date');
      if (!date) return false;
      var diff = Date.now() - new Date(date).getTime();
      var thirteenMonths = 13 * 30 * 24 * 60 * 60 * 1000;
      return diff < thirteenMonths;
    } catch (e) {
      return false;
    }
  }

  // Init
  if (getCookieConsent() && isConsentValid()) {
    hideBanner();
    if (getCookieConsent() === 'accepted') {
      // Charger analytics si accepté (placeholder)
      // loadAnalytics();
    }
  } else {
    showBanner();
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', function () {
      setCookieConsent('accepted');
      hideBanner();
      // loadAnalytics();
    });
  }

  if (cookieRefuse) {
    cookieRefuse.addEventListener('click', function () {
      setCookieConsent('refused');
      hideBanner();
    });
  }

  if (cookieParams) {
    cookieParams.addEventListener('click', function () {
      // Pour un site statique simple : même comportement que refuser
      // Un site plus complexe ouvrirait un modal de paramétrage
      setCookieConsent('refused');
      hideBanner();
    });
  }

  // Réouverture depuis le footer
  if (footerCookieBtn) {
    footerCookieBtn.addEventListener('click', function (e) {
      e.preventDefault();
      try { localStorage.removeItem('cookie_consent'); } catch (e) {}
      showBanner();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  }

  // ============================================
  // FORMULAIRE — Validation inline + Honeypot
  // (Utilisé sur pages/contact.html)
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
        form.querySelector('.field--error input, .field--error select').focus();
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
  // SMOOTH SCROLL pour les ancres
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var headerHeight = document.querySelector('.header').offsetHeight || 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

})();
