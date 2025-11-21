/**
 * HubSpot Form Submission Handler
 * Toggles visibility of elements based on form submission status
 * Persists state in localStorage
 */

const STORAGE_KEY = "hubspot_form_submitted_";

function showAfterState() {
  // Masque les éléments "before"
  const beforeElements = document.querySelectorAll(
    '[data-form-state="before"]'
  );
  beforeElements.forEach(function (el) {
    el.style.display = "none";
  });

  // Affiche les éléments "after"
  const afterElements = document.querySelectorAll('[data-form-state="after"]');
  afterElements.forEach(function (el) {
    el.style.display = "block";
  });
}

function initHubSpotFormHandler(formId) {
  // Vérifie si le formulaire a déjà été soumis
  if (localStorage.getItem(STORAGE_KEY + formId)) {
    showAfterState();
    return;
  }

  window.addEventListener("message", function (event) {
    // Vérifie que c'est un callback HubSpot de soumission réussie
    if (
      event.data.type === "hsFormCallback" &&
      event.data.eventName === "onFormSubmitted"
    ) {
      // Vérifie que c'est le bon formulaire
      if (formId && event.data.id !== formId) return;

      // Sauvegarde dans localStorage
      localStorage.setItem(STORAGE_KEY + formId, "true");

      showAfterState();
    }
  });
}

// Initialise avec l'ID du formulaire spécifique
document.addEventListener("DOMContentLoaded", function () {
  initHubSpotFormHandler("51a0232f-9baa-4b82-9376-db8b72f55139");
});
