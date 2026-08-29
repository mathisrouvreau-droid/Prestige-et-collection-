# Prestige & Collection — refonte du site

Refonte complète du site [prestigeetcollection.com](https://www.prestigeetcollection.com) :
le musée automobile vivant de Jallais (Anjou), « le musée que l'on peut conduire ».

## Le parti pris de design

**« La nuit à l'atelier »** — le musée après la fermeture, les machines sous une
lumière chaude :

- **Anthracite chaud** en fond, textes **ivoire**, accent unique **or champagne**
  (boutons, prix, cocardes) — les codes du prestige automobile, sans surcharge ;
- Typographies : **Bodoni Moda** (titres — l'esprit des affiches automobiles françaises),
  **Jost** (texte — géométrique façon Futura, la police des brochures d'époque),
  **IBM Plex Mono** (fiches techniques, distances, prix) ;
- Motifs maison : filets doubles, itinéraire pointillé, cocardes de rallye numérotées,
  damier d'arrivée, **dessins des voitures au trait, en gravures dorées** ;
- **Thème clair = ivoire & bronze** : pour les appareils réglés en mode clair, le site
  se décline en catalogue papier aux encres bronze (`prefers-color-scheme`) ;
- Toutes les couleurs sont des variables CSS en tête de `assets/css/style.css`
  (`--paper`, `--ink`, `--accent`, `--draw`…) : la palette entière se change là.

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
assets/img/photos/     Les 8 photos du site (+ PHOTOS.md, le mode d'emploi)
outils/                Script de récupération des photos Instagram
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
2. **Déposer les 8 photos Instagram.** Le site est déjà câblé pour les photos
   (accueil, univers de la collection, fiches d'expériences) : des visuels provisoires
   occupent les emplacements et indiquent chacun le nom de fichier attendu. Depuis un
   réseau non filtré, lancer `bash outils/recuperer-photos-instagram.sh` (ou enregistrer
   les photos à la main depuis [instagram.com/prestige_et_collection](https://www.instagram.com/prestige_et_collection/)),
   puis écraser les 8 fichiers de `assets/img/photos/` en gardant les mêmes noms —
   marche à suivre détaillée dans `assets/img/photos/PHOTOS.md`. Aucune modification
   de code n'est nécessaire. (Le téléchargement n'a pas pu être fait depuis
   l'environnement de développement : l'accès réseau à Instagram y est bloqué par
   la politique de sécurité.)
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
