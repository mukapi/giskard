/**
 * Newsletter Modal Handler
 * Gère l'ouverture et la fermeture de la popup newsletter HubSpot
 */

(function() {
  "use strict";

  // Attendre que le DOM soit chargé
  const init = () => {
    const modalButton = document.querySelector(".modal_button");
    const modal = document.querySelector(".modal_newsletter");
    const modalContent = document.querySelector(".modal_newsletter_layout");

    // Vérifier que tous les éléments existent
    if (!modalButton || !modal || !modalContent) {
      console.warn("Newsletter modal: Elements not found", {
        modalButton: !!modalButton,
        modal: !!modal,
        modalContent: !!modalContent
      });
      return;
    }

    // Cacher la modal au départ
    modal.style.display = "none";

    /**
     * Ouvre la modal
     */
    const openModal = (e) => {
      e.preventDefault();
      modal.style.display = "flex";
    };

    /**
     * Ferme la modal
     */
    const closeModal = () => {
      modal.style.display = "none";
    };

    // Ouvrir au clic sur le bouton
    modalButton.addEventListener("click", openModal);

    // Fermer avec la touche Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.style.display === "flex") {
        closeModal();
      }
    });

    // Fermer en cliquant en dehors du contenu
    // Fonctionne même si on clique sur les zones latérales avec padding
    modal.addEventListener("click", (e) => {
      if (!modalContent.contains(e.target)) {
        closeModal();
      }
    });
  };

  // Initialiser quand le DOM est prêt
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
