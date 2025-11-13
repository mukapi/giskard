# Fix : Débordement des tableaux sur mobile

## Problème

Sur mobile (viewport ≤ 767px), les tableaux dans les embeds (`.w-embed` à l'intérieur de `.text-rich-text`) débordent du parent et créent un scroll horizontal indésirable au niveau de la page entière.

**Cause racine :** Le tableau (536px) force son parent `.table-wrapper` à s'étirer, qui force `.w-embed` à s'étirer, qui force `.text-rich-text` à s'étirer, qui force `.template_blog-wrapper_content` à s'étirer... et ainsi de suite. **Tous les parents en cascade** dépassent alors la largeur du viewport mobile (~375px), créant un débordement horizontal de toute la page.

### Structure HTML
```
.template_blog-wrapper_content (800px → déborde !)
  └── .text-rich-text (800px → déborde !)
      └── .w-embed (800px → déborde !)
          └── .table-wrapper (800px → déborde !)
              └── table (536px)
```

### Symptômes
- Le tableau fait 536px, mais TOUS ses parents s'étirent aussi à 800px minimum
- Scroll horizontal sur toute la page au lieu d'être localisé au tableau
- Le tableau ne peut pas scroller indépendamment

## Solution

La solution consiste à **limiter la largeur de TOUS les parents** avec `max-width: 100%`, et activer le scroll uniquement sur `.table-wrapper`.

### CSS appliqué (src/styles.css)

```css
@media (max-width: 767px) {
  /* Empêcher TOUS les parents de s'étirer */
  .template_blog-wrapper_content,
  .text-rich-text,
  .text-rich-text .w-embed {
    max-width: 100% !important;
    min-width: 0 !important;
  }

  /* Le wrapper du tableau scrolle */
  .table-wrapper {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
    max-width: 100% !important;
  }
}
```

### Pourquoi ça marche

1. **`max-width: 100%`** sur tous les parents : Empêche chaque élément de dépasser la largeur de son conteneur
2. **`min-width: 0`** : Permet aux éléments en flexbox de rétrécir (par défaut `min-width: auto` empêche ça)
3. **`overflow-x: auto`** sur `.table-wrapper` : Active le scroll horizontal uniquement pour le tableau

Le tableau (536px) peut maintenant scroller dans `.table-wrapper` (largeur du viewport), sans faire déborder toute la page.

## Implémentation dans Webflow

1. Aller dans **Project Settings** > **Custom Code** > **Head Code**
2. Coller le CSS ci-dessus dans une balise `<style>`
3. Publier le site
4. Tester sur mobile (viewport < 767px)

## Fichiers concernés

- **`src/styles.css`** : Le fix CSS final (17 lignes)
- **`table.html`** : Structure HTML de référence avec CSS inline
- **`README.md`** : Cette documentation

## Résultat

✅ La page ne déborde plus horizontalement sur mobile
✅ Le tableau peut scroller indépendamment dans son wrapper
✅ Solution CSS pure, 2 règles simples, pas de JavaScript
✅ Compatible avec tous les navigateurs modernes (iOS, Android, Desktop)

