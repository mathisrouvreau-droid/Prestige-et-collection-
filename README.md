# Prestige & Collection — refonte du site

Refonte complète du site [prestigeetcollection.com](https://www.prestigeetcollection.com) :
le musée automobile vivant de Jallais (Anjou), « le musée que l'on peut conduire ».

## Le parti pris de design

**« Le catalogue d'atelier »** — un univers visuel puisé dans l'automobilia française
des années 50-60, loin des clichés « noir et doré » des sites de luxe :

- **Papier ivoire** de carte routière ancienne, **encre bleu de France**, **rouge course**
  en accent unique (boutons, prix, cocardes) ;
- Typographies : **Bodoni Moda** (titres — l'esprit des affiches automobiles françaises),
  **Jost** (texte — géométrique façon Futura, la police des brochures d'époque),
  **IBM Plex Mono** (fiches techniques, distances, prix) ;
- Motifs maison : filets doubles de cadre de carte, itinéraire pointillé, cocardes de
  rallye numérotées, damier d'arrivée, **dessins des voitures au trait façon blueprint** ;
- **Mode sombre = le cyanotype** : le catalogue s'inverse en plan d'atelier — traits
  crème sur bleu nuit (suit le réglage du système, `prefers-color-scheme`).

## Structure

```
index.html          Accueil (héros, credo, expériences, collection, infos pratiques)
collection.html     Les 4 univers de la collection
experiences.html    Visite commentée / baptême passager / conduite — fiches détaillées
tarifs.html         Barème 2026, bons cadeaux, groupes & entreprises
contact.html        Coordonnées, formulaire, FAQ
assets/css/style.css   Tout le design (variables en tête de fichier)
assets/js/main.js      Menu mobile, apparitions au défilement, formulaire mailto
assets/img/sprite.svg  Source des dessins SVG (copie inline dans chaque page)
assets/img/favicon.svg Favicon « volant »
```

Site **100 % statique** : aucun framework, aucune dépendance, aucune étape de build.
Seule ressource externe : les polices Google Fonts.

## Mettre en ligne

N'importe quel hébergement statique convient : le dossier se dépose tel quel
(OVH, o2switch, Netlify, GitHub Pages…). Pour GitHub Pages : *Settings → Pages →
Deploy from a branch*, choisir la branche et la racine `/`.

## À faire par le propriétaire du site

1. **Vérifier les tarifs et l'adresse e-mail.** Les prix affichés sont ceux du barème
   2026 publié (25 € / 60 € / 150 € / dès 250 €) et l'e-mail `info@prestigeetcollection.com`
   provient des annuaires — à confirmer avant mise en ligne. Le téléphone utilisé
   partout est le 07 88 47 23 76.
2. **Ajouter les vraies photos** (recommandé). Les dessins au trait sont un vrai choix
   graphique et le site fonctionne tel quel, mais des photos des véhicules feront
   vendre : remplacer le contenu des blocs `<figure class="hero-art">`,
   `<figure class="universe-art">` et `<figure class="plate-figure">` par des
   `<img src="assets/img/photos/….jpg" alt="…">`. Les dessins peuvent rester en
   habillage des sections secondaires.
3. **Formulaire de contact.** Sans serveur, le formulaire ouvre la messagerie du
   visiteur (mailto) — honnête et sans maintenance. Pour recevoir les demandes
   directement, brancher un service type Formspree ou le module de formulaire de
   l'hébergeur (remplacer le gestionnaire `form-contact` dans `assets/js/main.js`).
4. **Réservation en ligne** (optionnel). Les boutons « Réserver » pointent vers le
   téléphone et la page contact, fidèle au fonctionnement « sur rendez-vous ». Un module
   de réservation/paiement pourra s'y greffer plus tard sans toucher au design.

## Maintenance des pages

Les entêtes, pieds de page et dessins SVG sont dupliqués dans chaque page (choix
assumé d'un site sans build) : toute modification de ces blocs est à reporter dans
les 5 fichiers HTML. Les couleurs et polices se règlent en tête de
`assets/css/style.css` (variables `--paper`, `--ink`, `--red`, etc.).
