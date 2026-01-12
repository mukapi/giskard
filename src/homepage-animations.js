(function () {
  "use strict";

  // ========================================
  // CONFIGURATION
  // ========================================
  const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";
  const desktopMedia = window.matchMedia(DESKTOP_MEDIA_QUERY);

  // Sélecteurs basés sur les attributs data
  const navbar = document.querySelector('[data-navbar="main"]');
  const elementsToAnimate = document.querySelectorAll("[data-navbar-animate]");

  // Configuration des timings
  const CONFIG = {
    NAVBAR_FADE_DURATION: 150, // Durée du fade-in de la navbar (ms) - réduit de 200 à 150
    STAGGER_DELAY: 25, // Délai entre chaque élément (ms) - réduit de 40 à 25
    SLIDE_DISTANCE: 15, // Distance du slide from bottom (px) - réduit de 20 à 15
    ELEMENT_DURATION: 250, // Durée de l'animation des éléments (ms) - réduit de 300 à 250
    INITIAL_DELAY: 0, // Délai avant de lancer l'animation (ms)
  };
  const SCROLL_CONFIG = {
    OFFSET: 60, // Décalage vertical initial (px)
    DURATION: 0.8, // Durée de l'animation GSAP (s)
    EASE: "power2.out", // Courbe d'easing GSAP
    START: "top 80%", // Position de déclenchement ScrollTrigger
  };
  const COUNTER_CONFIG = {
    DURATION: 2000, // Durée de l'animation des compteurs (ms)
    TRIGGER_OFFSET: 100, // Décalage pour le déclenchement (px)
  };

  const scrollAnimations = [];
  const counterElements = new Set();
  const counterListeners = [];

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
    element.style.opacity = "0";
    element.style.transform = `translateY(${CONFIG.SLIDE_DISTANCE}px)`;
    element.style.transition = `opacity ${CONFIG.ELEMENT_DURATION}ms ease-out, transform ${CONFIG.ELEMENT_DURATION}ms ease-out`;
  }

  /**
   * Positionne la navbar dynamiquement en fonction de la présence de l'annonce
   * @param {Element} navbar - L'élément navbar
   */
  function positionNavbarDynamically(navbar) {
    if (!elementExists(navbar)) return;

    const navWrap = navbar.closest(".nav_wrap");

    // Si nav_wrap existe avec flexbox gap, laisser CSS gérer le positionnement
    // Le gap du flexbox créera automatiquement l'espace entre l'annonce et la navbar
    if (navWrap) {
      const navWrapStyles = window.getComputedStyle(navWrap);
      if (
        navWrapStyles.display === "flex" &&
        navWrapStyles.gap !== "normal" &&
        navWrapStyles.gap !== "0px"
      ) {
        // Le flexbox gap gère déjà l'espacement, nettoyer seulement les styles inline qui pourraient interférer
        // Ne pas modifier position car il pourrait être défini par CSS pour d'autres raisons
        navbar.style.top = "";
        navbar.style.marginTop = "";
        return;
      }
    }
  }

  /**
   * Formate un nombre avec des suffixes (K, M, etc.)
   * @param {number} value - Valeur à formater
   * @returns {string}
   */
  function formatNumber(value, decimals = 0) {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + "K";
    }
    if (decimals > 0) {
      return value.toFixed(decimals);
    }
    return Math.round(value).toString();
  }

  /**
   * Extrait une valeur numérique depuis une chaîne
   * @param {string|null} source
   * @returns {number}
   */
  function extractNumericValue(source) {
    if (typeof source !== "string") return NaN;

    const normalized = source.replace(/\s/g, "").replace(/,/g, ".");
    const match = normalized.match(/-?\d+(?:\.\d+)?/);

    return match ? parseFloat(match[0]) : NaN;
  }

  /**
   * Récupère la valeur finale du compteur
   * @param {Element} element
   * @returns {number|null}
   */
  function getCounterTargetValue(element) {
    const fromAttribute = extractNumericValue(
      element.getAttribute("data-counter-value")
    );
    if (Number.isFinite(fromAttribute)) {
      return fromAttribute;
    }

    const fromText = extractNumericValue(element.textContent);
    return Number.isFinite(fromText) ? fromText : null;
  }

  /**
   * Détermine le nombre de décimales à afficher
   * @param {Element} element
   * @param {number|null} value
   * @returns {number}
   */
  function getCounterDecimals(element, value) {
    const decimalsAttr = element.getAttribute("data-counter-decimals");
    if (decimalsAttr !== null) {
      const parsed = parseInt(decimalsAttr, 10);
      return !Number.isNaN(parsed) && parsed >= 0 ? parsed : 0;
    }

    const source =
      element.getAttribute("data-counter-value") || element.textContent;
    if (typeof source === "string") {
      const match = source.match(/[.,](\d+)/);
      if (match && match[1]) {
        return match[1].length;
      }
    }

    if (Number.isFinite(value)) {
      const [, decimalPart] = value.toString().split(".");
      return decimalPart ? decimalPart.length : 0;
    }

    return 0;
  }

  /**
   * Anime un élément vers son état final
   * @param {Element} element - L'élément à animer
   */
  function animateElement(element) {
    element.style.opacity = "1";
    element.style.transform = "translateY(0)";
  }

  /**
   * Vérifie si un élément est dans le viewport avec offset
   * @param {Element} element
   * @param {number} offset
   * @returns {boolean}
   */
  function isInViewport(element, offset) {
    const rect = element.getBoundingClientRect();
    return rect.top <= window.innerHeight - offset && rect.bottom >= offset;
  }

  /**
   * Anime un compteur numérique
   * @param {Element} element - L'élément compteur
   */
  function runCounterAnimation(element) {
    const finalValue = getCounterTargetValue(element);
    if (!Number.isFinite(finalValue)) return;

    const decimals = getCounterDecimals(element, finalValue);

    const startTime = performance.now();
    const startValue = 0;
    const duration =
      parseInt(element.getAttribute("data-counter-duration")) ||
      COUNTER_CONFIG.DURATION;
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
    const delta = finalValue - startValue;

    const tick = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const rawValue = startValue + delta * eased;
      const currentValue =
        decimals > 0
          ? Number(rawValue.toFixed(decimals))
          : Math.floor(rawValue);

      element.textContent = formatNumber(currentValue, decimals);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        element.textContent = formatNumber(finalValue, decimals);
      }
    };

    requestAnimationFrame(tick);
  }

  /**
   * Vérifie et anime les compteurs visibles
   */
  function checkAndAnimateCounters() {
    counterElements.forEach((counter) => {
      if (
        !counter.classList.contains("counter-animated") &&
        isInViewport(counter, COUNTER_CONFIG.TRIGGER_OFFSET)
      ) {
        counter.classList.add("counter-animated");
        runCounterAnimation(counter);
      }
    });
  }

  /**
   * Réinitialise les compteurs vers leur état d'origine
   */
  function resetCounterState() {
    counterElements.forEach((counter) => {
      const original = counter.getAttribute("data-counter-original");
      if (original !== null) {
        counter.textContent = original;
      }
      counter.classList.remove("counter-animated");
    });
    counterElements.clear();
  }

  /**
   * Supprime les animations GSAP existantes pour éviter les doublons
   */
  function resetScrollAnimations() {
    scrollAnimations.forEach((entry) => {
      if (entry.tween && typeof entry.tween.kill === "function") {
        entry.tween.kill();
      }
      if (entry.trigger && typeof entry.trigger.kill === "function") {
        entry.trigger.kill();
      }
    });

    scrollAnimations.length = 0;

    document.querySelectorAll("[data-scroll-animate]").forEach((el) => {
      el.style.opacity = "";
      el.style.transform = "";
    });

    if (
      window.ScrollTrigger &&
      typeof window.ScrollTrigger.refresh === "function"
    ) {
      window.ScrollTrigger.refresh();
    }
  }

  /**
   * Nettoie les styles injectés pour laisser le mobile intact
   */
  function resetInlineStyles() {
    if (elementExists(navbar)) {
      navbar.style.opacity = "";
      navbar.style.transition = "";
      navbar.style.marginTop = "";
      navbar.style.top = "";
      navbar.style.position = "";
    }

    elementsToAnimate.forEach((el) => {
      el.style.opacity = "";
      el.style.transform = "";
      el.style.transition = "";
    });

    resetCounterState();

    document.body.classList.remove("navbar-animation-ready");
  }

  /**
   * Vérifie si on est sur desktop (≥ 992px)
   * @returns {boolean}
   */
  function isDesktop() {
    return desktopMedia.matches;
  }

  /**
   * Initialise les animations au scroll via GSAP / ScrollTrigger
   */
  function initScrollAnimations() {
    const { gsap, ScrollTrigger } = window;

    if (!gsap || !ScrollTrigger) {
      console.warn(
        "[homepage-animations] GSAP ou ScrollTrigger est introuvable dans la page."
      );
      return;
    }

    if (typeof gsap.registerPlugin === "function") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const animatedElements = document.querySelectorAll("[data-scroll-animate]");

    animatedElements.forEach((element) => {
      const offset =
        parseFloat(element.getAttribute("data-scroll-offset")) ||
        SCROLL_CONFIG.OFFSET;
      const duration =
        parseFloat(element.getAttribute("data-scroll-duration")) ||
        SCROLL_CONFIG.DURATION;
      const delay = parseFloat(element.getAttribute("data-scroll-delay")) || 0;
      const ease =
        element.getAttribute("data-scroll-ease") || SCROLL_CONFIG.EASE;
      const start =
        element.getAttribute("data-scroll-start") || SCROLL_CONFIG.START;
      const onceAttr = element.getAttribute("data-scroll-once");
      const once = onceAttr === null ? true : onceAttr !== "false";

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
          toggleActions: once
            ? "play none none none"
            : "play none none reverse",
        },
      });

      scrollAnimations.push({
        tween,
        trigger: tween.scrollTrigger,
      });
    });

    if (typeof ScrollTrigger.refresh === "function") {
      ScrollTrigger.refresh();
    }
  }

  /**
   * Prépare les éléments compteurs pour l'animation
   */
  function bindCounters() {
    const counters = document.querySelectorAll("[data-counter]");

    counters.forEach((counter) => {
      if (!counter.hasAttribute("data-counter-original")) {
        counter.setAttribute("data-counter-original", counter.textContent);
      }
      counterElements.add(counter);
    });
  }

  /**
   * Initialise les animations de compteurs
   */
  function initCounterAnimations() {
    if (counterElements.size === 0) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      requestAnimationFrame(() => {
        checkAndAnimateCounters();
        ticking = false;
      });

      ticking = true;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    counterListeners.push(() => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    });

    checkAndAnimateCounters();
  }

  /**
   * Retire les écouteurs liés aux compteurs
   */
  function removeCounterListeners() {
    counterListeners.forEach((dispose) => dispose());
    counterListeners.length = 0;
  }

  // ========================================
  // INITIALISATION
  // ========================================

  /**
   * Initialise l'animation de la navbar
   * Optimisation LCP : attend le premier paint avant de masquer les éléments
   * Cela permet au navigateur de capturer le LCP avant que l'animation commence
   */
  function initNavbarAnimation() {
    // Étape 1 : Positionner la navbar dynamiquement
    positionNavbarDynamically(navbar);

    // Convertir NodeList en Array et trier par ordre d'apparition
    const elementsArray = Array.from(elementsToAnimate);

    // Trier par l'attribut data-navbar-order si présent, sinon par ordre DOM
    elementsArray.sort((a, b) => {
      const orderA = parseInt(a.getAttribute("data-navbar-order")) || 999;
      const orderB = parseInt(b.getAttribute("data-navbar-order")) || 999;
      return orderA - orderB;
    });

    // Optimisation LCP : attendre le premier paint avant de masquer les éléments
    // Double requestAnimationFrame garantit que le premier paint est passé
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Étape 2 : Masquer la navbar APRÈS le premier paint
        if (elementExists(navbar)) {
          navbar.style.opacity = "0";
          navbar.style.transition = `opacity ${CONFIG.NAVBAR_FADE_DURATION}ms ease-out`;
        }

        // Étape 3 : Préparer les éléments internes (masqués + positionnés en bas)
        const allElements = [];
        elementsArray.forEach((el) => {
          applyInitialStyles(el);
          allElements.push(el);
        });

        // Étape 4 : Lancer les animations immédiatement après
        runAnimationSequence(allElements);
      });
    });
  }

  /**
   * Exécute la séquence d'animation (appelée après le premier paint)
   * @param {Element[]} allElements
   */
  function runAnimationSequence(allElements) {
    document.body.classList.add("navbar-animation-ready");

    if (elementExists(navbar)) {
      navbar.style.opacity = "1";
    }

    allElements.forEach((el, index) => {
      setTimeout(() => {
        animateElement(el);
      }, CONFIG.NAVBAR_FADE_DURATION / 2 + index * CONFIG.STAGGER_DELAY);
    });
  }

  /**
   * Initialise toutes les animations desktop
   */
  function initHomepageAnimations() {
    removeCounterListeners();
    resetInlineStyles();
    resetScrollAnimations();
    bindCounters();
    initCounterAnimations();

    if (!isDesktop()) return;

    initNavbarAnimation();
    initScrollAnimations();
  }

  // ========================================
  // LANCEMENT DU SCRIPT
  // ========================================

  // Vérifier que le DOM est prêt
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomepageAnimations);
  } else {
    // DOM déjà chargé
    initHomepageAnimations();
  }

  // ========================================
  // API PUBLIQUE (optionnelle)
  // ========================================

  // Exposer une fonction pour relancer l'animation si nécessaire
  window.homepageAnimations = {
    /**
     * Relance toutes les animations desktop
     */
    restart() {
      removeCounterListeners();
      resetInlineStyles();
      resetScrollAnimations();
      initHomepageAnimations();
    },

    /**
     * Relance seulement les compteurs
     */
    restartCounters() {
      removeCounterListeners();
      resetCounterState();
      bindCounters();
      initCounterAnimations();
    },

    /**
     * Anime un compteur manuellement
     * @param {string|Element} selector - Sélecteur ou élément cible
     */
    animateCounter(selector) {
      const element =
        typeof selector === "string"
          ? document.querySelector(selector)
          : selector;

      if (!element || !element.hasAttribute("data-counter")) return;

      if (!element.hasAttribute("data-counter-original")) {
        element.setAttribute("data-counter-original", element.textContent);
      }

      counterElements.add(element);
      element.classList.remove("counter-animated");
      runCounterAnimation(element);
    },

    /**
     * Obtient la configuration actuelle
     * @returns {Object} Configurations combinées
     */
    getConfig() {
      return {
        navbar: { ...CONFIG },
        scroll: { ...SCROLL_CONFIG },
        counter: { ...COUNTER_CONFIG },
      };
    },
  };

  // Compatibilité avec l'ancien namespace counterAnimation
  window.counterAnimation = {
    restart() {
      window.homepageAnimations.restartCounters();
    },
    animateCounter(selector) {
      window.homepageAnimations.animateCounter(selector);
    },
    getConfig() {
      return { ...COUNTER_CONFIG };
    },
  };

  // Réagir aux changements de viewport (resize)
  const handleMediaChange = () => {
    initHomepageAnimations();
  };

  // Réagir aux changements de taille de l'annonce
  const handleResize = () => {
    if (isDesktop() && elementExists(navbar)) {
      positionNavbarDynamically(navbar);
    }
  };

  if (typeof desktopMedia.addEventListener === "function") {
    desktopMedia.addEventListener("change", handleMediaChange);
  } else if (typeof desktopMedia.addListener === "function") {
    desktopMedia.addListener(handleMediaChange);
  }

  // Écouter les changements de taille pour repositionner la navbar
  window.addEventListener("resize", handleResize, { passive: true });
})();
