(function() {
  'use strict';

  // ========================================
  // CONFIGURATION
  // ========================================
  const DESKTOP_MEDIA_QUERY = '(min-width: 992px)';
  const desktopMedia = window.matchMedia(DESKTOP_MEDIA_QUERY);
  
  // Sélecteurs basés sur les attributs data
  const navbar = document.querySelector('[data-navbar="main"]');
  const elementsToAnimate = document.querySelectorAll('[data-navbar-animate]');

  // Configuration des timings
  const CONFIG = {
    NAVBAR_FADE_DURATION: 300,  // Durée du fade-in de la navbar (ms)
    STAGGER_DELAY: 80,          // Délai entre chaque élément (ms)
    SLIDE_DISTANCE: 20,         // Distance du slide from bottom (px)
    ELEMENT_DURATION: 400,      // Durée de l'animation des éléments (ms)
    INITIAL_DELAY: 200          // Délai avant de lancer l'animation (ms)
  };
  const SCROLL_CONFIG = {
    OFFSET: 32,           // Décalage vertical initial (px)
    DURATION: 0.8,        // Durée de l'animation GSAP (s)
    EASE: 'power2.out',   // Courbe d'easing GSAP
    START: 'top 80%',     // Position de déclenchement ScrollTrigger
  };

  const scrollAnimations = [];

  // ========================================
  // FONCTIONS UTILITAIRES
  // ========================================

  /**
   * Vérifie si un élément existe dans le DOM
   * @param {Element} element - L'élément à vérifier
   * @returns {boolean}
   */
  function elementExists(element) {
    return element !== null && element !== undefined;
  }

  /**
   * Applique les styles initiaux aux éléments
   * @param {Element} element - L'élément à styliser
   */
  function applyInitialStyles(element) {
    element.style.opacity = '0';
    element.style.transform = `translateY(${CONFIG.SLIDE_DISTANCE}px)`;
    element.style.transition = `opacity ${CONFIG.ELEMENT_DURATION}ms ease-out, transform ${CONFIG.ELEMENT_DURATION}ms ease-out`;
  }

  /**
   * Anime un élément vers son état final
   * @param {Element} element - L'élément à animer
   */
  function animateElement(element) {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }

  /**
   * Supprime les animations GSAP existantes pour éviter les doublons
   */
  function resetScrollAnimations() {
    scrollAnimations.forEach(entry => {
      if (entry.tween && typeof entry.tween.kill === 'function') {
        entry.tween.kill();
      }
      if (entry.trigger && typeof entry.trigger.kill === 'function') {
        entry.trigger.kill();
      }
    });

    scrollAnimations.length = 0;

    document.querySelectorAll('[data-scroll-animate]').forEach(el => {
      el.style.opacity = '';
      el.style.transform = '';
    });

    if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
      window.ScrollTrigger.refresh();
    }
  }

  /**
   * Nettoie les styles injectés pour laisser le mobile intact
   */
  function resetInlineStyles() {
    if (elementExists(navbar)) {
      navbar.style.opacity = '';
      navbar.style.transition = '';
    }

    elementsToAnimate.forEach(el => {
      el.style.opacity = '';
      el.style.transform = '';
      el.style.transition = '';
    });

    document.body.classList.remove('navbar-animation-ready');
  }

  /**
   * Vérifie si on est sur desktop (≥ 992px)
   * @returns {boolean}
   */
  function isDesktop() {
    return desktopMedia.matches;
  }

  /**
   * Démarre la séquence d'animation après chargement
   * @param {Element[]} allElements
   */
  function startAnimation(allElements) {
    const runSequence = () => {
      document.body.classList.add('navbar-animation-ready');

      if (elementExists(navbar)) {
        navbar.style.opacity = '1';
      }

      allElements.forEach((el, index) => {
        setTimeout(() => {
          animateElement(el);
        }, CONFIG.NAVBAR_FADE_DURATION + index * CONFIG.STAGGER_DELAY);
      });
    };

    const scheduleSequence = () => {
      setTimeout(runSequence, CONFIG.INITIAL_DELAY);
    };

    if (document.readyState === 'complete') {
      scheduleSequence();
    } else {
      window.addEventListener('load', scheduleSequence, { once: true });
    }
  }

  /**
   * Initialise les animations au scroll via GSAP / ScrollTrigger
   */
  function initScrollAnimations() {
    const { gsap, ScrollTrigger } = window;

    if (!gsap || !ScrollTrigger) {
      console.warn('[homepage-animations] GSAP ou ScrollTrigger est introuvable dans la page.');
      return;
    }

    if (typeof gsap.registerPlugin === 'function') {
      gsap.registerPlugin(ScrollTrigger);
    }

    const animatedElements = document.querySelectorAll('[data-scroll-animate]');

    animatedElements.forEach(element => {
      const offset = parseFloat(element.getAttribute('data-scroll-offset')) || SCROLL_CONFIG.OFFSET;
      const duration = parseFloat(element.getAttribute('data-scroll-duration')) || SCROLL_CONFIG.DURATION;
      const delay = parseFloat(element.getAttribute('data-scroll-delay')) || 0;
      const ease = element.getAttribute('data-scroll-ease') || SCROLL_CONFIG.EASE;
      const start = element.getAttribute('data-scroll-start') || SCROLL_CONFIG.START;
      const onceAttr = element.getAttribute('data-scroll-once');
      const once = onceAttr === null ? true : onceAttr !== 'false';

      gsap.set(element, { opacity: 0, y: offset });

      const tween = gsap.to(element, {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease,
        scrollTrigger: {
          trigger: element,
          start,
          once,
          toggleActions: once ? 'play none none none' : 'play none none reverse',
        },
      });

      scrollAnimations.push({
        tween,
        trigger: tween.scrollTrigger,
      });
    });

    if (typeof ScrollTrigger.refresh === 'function') {
      ScrollTrigger.refresh();
    }
  }

  // ========================================
  // INITIALISATION
  // ========================================

  /**
   * Initialise l'animation de la navbar
   */
  function initNavbarAnimation() {
    // Étape 1 : Masquer la navbar au chargement
    if (elementExists(navbar)) {
      navbar.style.opacity = '0';
      navbar.style.transition = `opacity ${CONFIG.NAVBAR_FADE_DURATION}ms ease-out`;
    }

    // Étape 2 : Préparer les éléments internes (masqués + positionnés en bas)
    const allElements = [];
    
    // Convertir NodeList en Array et trier par ordre d'apparition
    const elementsArray = Array.from(elementsToAnimate);
    
    // Trier par l'attribut data-navbar-order si présent, sinon par ordre DOM
    elementsArray.sort((a, b) => {
      const orderA = parseInt(a.getAttribute('data-navbar-order')) || 999;
      const orderB = parseInt(b.getAttribute('data-navbar-order')) || 999;
      return orderA - orderB;
    });
    
    elementsArray.forEach(el => {
      applyInitialStyles(el);
      allElements.push(el);
    });

    // Étape 3 : Lancer les animations au chargement
    startAnimation(allElements);
  }

  /**
   * Initialise toutes les animations desktop
   */
  function initDesktopAnimations() {
    if (!isDesktop()) {
      resetInlineStyles();
      resetScrollAnimations();
      return;
    }

    resetScrollAnimations();
    initNavbarAnimation();
    initScrollAnimations();
  }

  // ========================================
  // LANCEMENT DU SCRIPT
  // ========================================

  // Vérifier que le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDesktopAnimations);
  } else {
    // DOM déjà chargé
    initDesktopAnimations();
  }

  // ========================================
  // API PUBLIQUE (optionnelle)
  // ========================================

  // Exposer une fonction pour relancer l'animation si nécessaire
  window.homepageAnimations = {
    /**
     * Relance l'animation de la navbar
     */
    restart: function() {
      resetInlineStyles();
      resetScrollAnimations();
      initDesktopAnimations();
    },
    
    /**
     * Obtient la configuration actuelle
     * @returns {Object} Configuration
     */
    getConfig: function() {
      return { ...CONFIG };
    }
  };

  // Réagir aux changements de viewport (resize)
  const handleMediaChange = event => {
    if (event.matches) {
      initDesktopAnimations();
    } else {
      resetInlineStyles();
      resetScrollAnimations();
    }
  };

  if (typeof desktopMedia.addEventListener === 'function') {
    desktopMedia.addEventListener('change', handleMediaChange);
  } else if (typeof desktopMedia.addListener === 'function') {
    desktopMedia.addListener(handleMediaChange);
  }

})();
