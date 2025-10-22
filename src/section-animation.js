/**
 * 🎯 COUNTER ANIMATION - SCROLL TRIGGERED
 * 
 * Script pour animer des compteurs numériques au scroll
 * Les chiffres partent de 0 et arrivent à leur valeur finale
 * 
 * Usage: Inclure ce script dans votre page HTML
 * 
 * ATTRIBUTS À AJOUTER DANS WEBFLOW :
 * - data-counter : sur les spans contenant les chiffres
 * - data-counter-value : valeur finale du compteur (optionnel)
 */

(function() {
  'use strict';

  // ========================================
  // CONFIGURATION
  // ========================================
  
  const CONFIG = {
    COUNTER_DURATION: 2000,    // Durée de l'animation des compteurs (ms)
    TRIGGER_OFFSET: 100,       // Distance du viewport pour déclencher (px)
    COUNTER_EASING: 'easeOutQuart' // Type d'easing pour les compteurs
  };

  // ========================================
  // FONCTIONS UTILITAIRES
  // ========================================

  /**
   * Vérifie si un élément est dans le viewport
   * @param {Element} element - L'élément à vérifier
   * @returns {boolean}
   */
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= window.innerHeight - CONFIG.TRIGGER_OFFSET &&
      rect.bottom >= CONFIG.TRIGGER_OFFSET
    );
  }


  /**
   * Fonction d'easing pour les compteurs
   * @param {number} t - Temps (0 à 1)
   * @returns {number}
   */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  /**
   * Formate un nombre avec des suffixes (K, M, etc.)
   * @param {number} value - Valeur à formater
   * @returns {string}
   */
  function formatNumber(value) {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K';
    }
    return value.toString();
  }

  /**
   * Anime un compteur
   * @param {Element} element - L'élément à animer
   */
  function animateCounter(element) {
    const finalValue = parseInt(element.getAttribute('data-counter-value')) || 
                      parseInt(element.textContent.replace(/[^\d]/g, ''));
    
    if (!finalValue) return;

    const startTime = performance.now();
    const startValue = 0;

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / CONFIG.COUNTER_DURATION, 1);
      const easedProgress = easeOutQuart(progress);
      
      const currentValue = Math.floor(startValue + (finalValue - startValue) * easedProgress);
      
      // Formater le nombre avec suffixes
      element.textContent = formatNumber(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // S'assurer qu'on arrive exactement à la valeur finale
        element.textContent = formatNumber(finalValue);
      }
    }

    requestAnimationFrame(updateCounter);
  }


  /**
   * Vérifie et anime les compteurs visibles
   */
  function checkAndAnimateCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    
    counters.forEach(counter => {
      if (!counter.classList.contains('counter-animated') && isInViewport(counter)) {
        counter.classList.add('counter-animated');
        animateCounter(counter);
      }
    });
  }

  // ========================================
  // INITIALISATION
  // ========================================

  /**
   * Initialise l'animation des compteurs
   */
  function initCounterAnimation() {
    // Vérifier au scroll
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkAndAnimateCounters();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll);
    
    // Vérifier au chargement (au cas où des compteurs seraient déjà visibles)
    checkAndAnimateCounters();
  }

  // ========================================
  // LANCEMENT DU SCRIPT
  // ========================================

  // Vérifier que le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounterAnimation);
  } else {
    // DOM déjà chargé
    initCounterAnimation();
  }

  // ========================================
  // API PUBLIQUE
  // ========================================

  // Exposer une fonction pour relancer l'animation si nécessaire
  window.counterAnimation = {
    /**
     * Relance l'animation des compteurs
     */
    restart: function() {
      // Reset tous les compteurs
      const counters = document.querySelectorAll('[data-counter]');
      counters.forEach(counter => {
        counter.classList.remove('counter-animated');
      });
      initCounterAnimation();
    },
    
    /**
     * Anime manuellement un compteur
     * @param {string|Element} selector - Sélecteur ou élément du compteur
     */
    animateCounter: function(selector) {
      const counter = typeof selector === 'string' 
        ? document.querySelector(selector) 
        : selector;
      
      if (counter && counter.hasAttribute('data-counter')) {
        counter.classList.add('counter-animated');
        animateCounter(counter);
      }
    },
    
    /**
     * Obtient la configuration actuelle
     * @returns {Object} Configuration
     */
    getConfig: function() {
      return { ...CONFIG };
    }
  };

})();

