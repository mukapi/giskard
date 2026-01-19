# Newsletter Modal - Giskard

Popup newsletter avec formulaire HubSpot pour le site Giskard.

## Fichiers

- **`styles.css`** - Styles CSS pour le formulaire HubSpot dans la popup
- **`script.js`** - Script JavaScript pour gérer l'ouverture/fermeture de la modal

## Utilisation dans Webflow

### CSS
Copier le contenu de `styles.css` dans :
- Settings > Custom Code > Head Code (dans un tag `<style>`)

### JavaScript
Copier le contenu de `script.js` dans :
- Settings > Custom Code > Footer Code (dans un tag `<script>`)

## Fonctionnalités

### Styles CSS
- Formulaire en colonne avec gap de 1.38rem
- Bouton pleine largeur
- Messages d'erreur avec espacement et padding-left de 1.4rem

### Script JS
- Modal cachée au chargement
- Ouverture au clic sur `.modal_button`
- Fermeture avec touche Escape
- Fermeture en cliquant en dehors du contenu (fonctionne sur toute la zone, y compris les côtés)

## Notes

### Submit du formulaire en staging
Le formulaire HubSpot peut ne pas soumettre en environnement staging à cause des restrictions CORS et cookies SameSite. C'est normal. Le formulaire fonctionnera correctement en production sur le domaine final.
