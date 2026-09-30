# Ô Sublime — refonte du site

Refonte complète et modernisée du site [o-sublime.com](https://www.o-sublime.com) :
**Ô Sublime**, institut de beauté & spa privatif à Jallais (49510 Beaupréau-en-Mauges),
au cœur des Mauges, entre Cholet, Nantes et Angers.

## Le parti pris de design

**« Noir, ivoire & or »** — chic & cocooning, calé sur le logo de l'institut
(la couronne de feuilles d'or, le wordmark noir, le sous-titre doré) :

- Fond **ivoire**, cartes **blanc chaud**, sections alternées **or voilé**,
  texte **noir chaud** (celui du wordmark), accent **bronze doré** (boutons,
  liens — l'or de la couronne assombri pour rester lisible), **or exact du
  logo `#B08C43`** sur les fonds sombres, et **écrins noir chaud** (bandeaux
  bon cadeau / fidélité, pied de page) rehaussés d'or ;
- Le logo (couronne détourée `assets/img/logo-couronne.png`, version complète
  `assets/img/logo.png`, favicon) est intégré en en-tête et pied de page ; la couronne
  existe aussi en vectoriel (`logo-couronne.svg`) pour l'animation ;
- Ambiance : lueurs douces en tête de page, liseré « galerie » sur les photos,
  rayons adoucis, ombres chaudes ;
- Typographies : **Cormorant Garamond** (titres, italiques précieuses) et
  **Manrope** (texte et interface) ;
- Motif maison : les **ondulations concentriques** du « Ô », comme une goutte
  dans l'eau — en héros, en filigrane, dans le favicon ;
- Illustrations au trait (plume, éclair, regard, soleil, cœur) pour les soins
  sans photo ;
- **Version claire unique** : le site affiche la même identité ivoire/or sur
  tous les appareils, y compris ceux réglés en mode sombre (choix assumé —
  seuls les écrins et le pied de page sont volontairement sombres) ;
- Toutes les couleurs sont des variables CSS en tête de `assets/css/style.css`
  (`--paper`, `--ink`, `--accent`, `--brass`…) : la palette entière se change là.
- Les **visuels provisoires** (`assets/img/photos/`) sont de vrais cadres d'attente —
  dégradé ivoire/or, couronne en filigrane, ondes, grain fin — avec une étiquette
  « photo à venir » qui donne le nom du fichier à remplacer.

## Structure

```
index.html          Accueil : héros, philosophie, spa privatif, soins, escales,
                    bon cadeau, infos pratiques
spa.html            Le spa privatif : jacuzzi / sauna infrarouge / hammam,
                    déroulé, escales spa + soin, abonnements, privatisation
soins.html          Les soins : visage, corps & massages, épilations,
                    lumière pulsée, regard, mains & pieds, maquillage &
                    bronzage, jeunes & ados, fidélité
contact.html        Coordonnées, horaires, formulaire, FAQ
assets/css/style.css   Tout le design (variables en tête de fichier)
assets/css/motion.css  Couche « mouvement » (retirable, voir plus bas)
assets/js/main.js      Menu mobile, apparitions, formulaire mailto
assets/js/motion.js    Chorégraphie : couronne, rideau, poussière d'or, interrupteur…
assets/js/wreath.js    La couronne du logo vectorisée, feuille par feuille (générée)
assets/img/logo*.png   Logo complet, couronne détourée, favicon
assets/img/logo-couronne.svg   La couronne en vectoriel (générée)
assets/img/photos/     Les 9 photos du site (+ PHOTOS.md, le mode d'emploi)
outils/                Récupération des photos (site + Instagram) ;
                       vectorisation de la couronne si le logo change
```

Site **100 % statique** : aucun framework, aucune dépendance, aucune étape de build.
Seule ressource externe : les polices Google Fonts. Données structurées
`schema.org/BeautySalon` intégrées sur l'accueil (adresse, horaires, téléphone)
pour le référencement local.

## Le mouvement

**Idée directrice : « Ô » se prononce « eau ».** Le mouvement du site est celui de
l'eau, de la lumière et de l'or — lent, souple, jamais nerveux :

- **Le héros** : la couronne du logo éclot — six tiges s'enroulent, puis dix-huit
  feuilles s'ouvrent une à une depuis leur tige — avant de tourner très lentement,
  entourée d'ondes qui s'élargissent comme sur l'eau. Le titre monte mot par mot.
- **Le rideau** : entre deux pages, un panneau chaud se lève, la couronne éclot en son
  centre, puis il libère la page suivante.
- **Au défilement** : titres qui montent d'un masque, photos qui se dévoilent en
  montant puis respirent (parallaxe douce), icônes qui se dessinent au trait, cartes
  qui se lèvent l'une après l'autre, défilé continu des marques, barre de progression.
- **Détails** : poussière d'or flottante (canvas) dans le héros et les écrins, reflet
  d'or sur les mots en italique, reflet qui balaie les boutons, onde au clic,
  inclinaison des cartes et attraction des boutons (souris), FAQ qui s'ouvre en douceur,
  sommaire des soins qui suit la lecture.
- **Fonctionnel** : pastille « Ouvert · jusqu'à 19 h » (heure de Paris) et ligne
  « aujourd'hui » dans les horaires.

**Accessibilité et robustesse** — la couche est **retirable** : sans `motion.css` /
`motion.js` (et leur balise `<script>` de la page), le site est exactement la version
sobre. Elle ne s'active que si JavaScript tourne, si l'appareil n'a pas demandé de
« réduire les animations » et si le petit bouton rond en bas à gauche (interrupteur
« Animations ») n'a pas été coupé — le choix est mémorisé. Si `motion.js` ne se charge
pas, le site retombe tout seul en version sobre au bout de 5 secondes. Sans JavaScript,
tout le contenu reste visible.

**Retirer le mouvement** : dans les 4 pages HTML, supprimer la ligne
`<link … motion.css>`, le bloc `<script>` « Couche mouvement » de l'en-tête et les deux
`<script src=…wreath.js / motion.js>` en fin de page.

**Changer le logo** : remplacer `assets/img/logo.png` (et `logo-couronne.png`), puis
`pip install pillow numpy scipy potracer && python3 outils/vectoriser-couronne.py`
régénère la couronne animée. L'ordre d'éclosion et les vitesses se règlent dans
`assets/css/motion.css` (section 5).

## Mettre en ligne

N'importe quel hébergement statique convient : le dossier se dépose tel quel
(OVH, o2switch, Netlify, GitHub Pages…). Pour GitHub Pages : *Settings → Pages →
Deploy from a branch*, choisir la branche et la racine `/`.

## À faire par la propriétaire du site

1. **Déposer les 9 photos.** Le site est déjà câblé : des visuels provisoires
   occupent les emplacements et indiquent chacun le nom de fichier attendu.
   Depuis un réseau non filtré, lancer `bash outils/recuperer-photos.sh`
   (il aspire les images de l'ancien site et, en option, d'Instagram), puis
   écraser les 9 fichiers de `assets/img/photos/` en gardant les mêmes noms —
   marche à suivre détaillée dans `assets/img/photos/PHOTOS.md`. Aucune
   modification de code n'est nécessaire. (Le téléchargement n'a pas pu être
   fait depuis l'environnement de développement : l'accès réseau à
   o-sublime.com y est bloqué par la politique de sécurité.)
2. **Vérifier les informations reprises des annuaires.** Téléphone
   `06 86 80 18 20`, e-mail `info@o-sublime.com`, horaires (mar.–ven.
   9 h–12 h / 14 h–19 h, sam. 9 h–17 h), lien de réservation Kalendes, note
   « 4,9/5 » des avis en ligne : tout provient du site actuel et des annuaires
   publics — à confirmer avant mise en ligne.
3. **Les tarifs ne sont pas affichés** (choix assumé : ils vivent déjà sur la
   réservation en ligne Kalendes et changent avec la carte). Chaque prestation
   pointe vers la réservation. Pour afficher des prix sur le site, ajouter
   simplement la ligne voulue dans les listes `care-points` de `soins.html`.
4. **Formulaire de contact.** Sans serveur, le formulaire ouvre la messagerie
   du visiteur (mailto) — honnête et sans maintenance. Pour recevoir les
   demandes directement, brancher un service type Formspree (remplacer le
   gestionnaire `form-contact` dans `assets/js/main.js` ; l'adresse de
   réception se règle en tête de ce même fichier).
5. **Mentions légales.** L'ancien site avait une page « Mentions légales » :
   à recréer avec les informations de l'entreprise (raison sociale, SIRET,
   hébergeur) avant la mise en production.

## Maintenance des pages

Les entêtes et pieds de page sont dupliqués dans chaque page (choix assumé d'un
site sans build) : toute modification de ces blocs est à reporter dans les
4 fichiers HTML. Les couleurs et polices se règlent en tête de
`assets/css/style.css`.
