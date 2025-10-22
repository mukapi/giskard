/**
 * 🎯 ANIMATION NAVBAR - STAGGERED ENTRANCE
 * 
 * Script pour gérer l'animation d'entrée progressive des éléments de navigation
 * avec un effet de slide depuis le bas et un délai échelonné entre les éléments.
 * 
 * Usage: Inclure ce script dans votre page HTML
 * 
 * IMPORTANT: Ajoutez ce CSS dans Webflow → Custom Code → Head Code AVANT le script :
 * 
 * <style>
 * /* Masquer par défaut, mais visible dans le mode designer */
 * [data-navbar="main"] { 
 *   opacity: 0; 
 * }
 * [data-navbar-animate] { 
 *   opacity: 0; 
 *   transform: translateY(20px); 
 * }
 * 
 * /* Révéler dans le mode designer */
 * body.wf-design-mode [data-navbar="main"] { 
 *   opacity: 1; 
 * }
 * body.wf-design-mode [data-navbar-animate] { 
 *   opacity: 1; 
 *   transform: translateY(0); 
 * }
 * </style>
 */

(function() {
  'use strict';

  // ========================================
  // CONFIGURATION
  // ========================================
  
  // Sélecteurs basés sur les attributs data
  const navbar = document.querySelector('[data-navbar="main"]');
  const elementsToAnimate = document.querySelectorAll('[data-navbar-animate]');

  // Configuration des timings
  const CONFIG = {
    NAVBAR_FADE_DURATION: 300,  // Durée du fade-in de la navbar (ms)
    STAGGER_DELAY: 80,          // Délai entre chaque élément (ms)
    SLIDE_DISTANCE: 20,         // Distance du slide from bottom (px)
    ELEMENT_DURATION: 400       // Durée de l'animation des éléments (ms)
  };

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
    window.addEventListener('load', () => {
      // Ajouter la classe pour activer les transitions CSS
      document.body.classList.add('navbar-animation-ready');
      
      // Faire apparaître la navbar d'abord
      if (elementExists(navbar)) {
        navbar.style.opacity = '1';
      }

      // Ensuite animer les éléments un par un avec délai progressif
      allElements.forEach((el, index) => {
        setTimeout(() => {
          animateElement(el);
        }, CONFIG.NAVBAR_FADE_DURATION + (index * CONFIG.STAGGER_DELAY));
      });
    });
  }

  // ========================================
  // LANCEMENT DU SCRIPT
  // ========================================

  // Vérifier que le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbarAnimation);
  } else {
    // DOM déjà chargé
    initNavbarAnimation();
  }

  // ========================================
  // API PUBLIQUE (optionnelle)
  // ========================================

  // Exposer une fonction pour relancer l'animation si nécessaire
  window.navbarAnimation = {
    /**
     * Relance l'animation de la navbar
     */
    restart: function() {
      initNavbarAnimation();
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
