# Photos du site — mode d'emploi

Le site est **prêt à recevoir les photos** : chaque emplacement affiche pour l'instant
un visuel provisoire qui indique le nom de fichier attendu. Il suffit de **remplacer
chaque fichier par la photo choisie, en gardant exactement le même nom** — aucune
modification du code n'est nécessaire.

## Les 8 emplacements

| Fichier                  | Où il apparaît                              | Photo idéale |
|--------------------------|---------------------------------------------|--------------|
| `hero.jpg`               | Accueil, image principale                    | La plus belle vue du musée ou d'un véhicule phare (cadrage horizontal) |
| `univers-sportives.jpg`  | Accueil + Collection — « Sportives & GT »    | GT40, Ferrari, Lamborghini… |
| `univers-majestes.jpg`   | Accueil + Collection — « Les majestés »      | Rolls-Royce, Lagonda, limousine |
| `univers-amerique.jpg`   | Accueil + Collection — « L'Amérique »        | Cadillac, Hummer, chromes |
| `univers-atypiques.jpg`  | Accueil + Collection — « Les inclassables »  | Vanderhall, moto, curiosité |
| `xp-visite.jpg`          | Expériences — la visite commentée            | Visiteurs dans le musée, montée à bord |
| `xp-passager.jpg`        | Expériences — le baptême passager            | Cabriolet ou Vanderhall sur route |
| `xp-conduite.jpg`        | Expériences — prendre le volant              | Conducteur au volant, mains sur le volant |

## Récupérer les photos depuis Instagram (@prestige_et_collection)

Depuis un ordinateur, deux méthodes :

**Méthode simple (manuelle)** — ouvrir [instagram.com/prestige_et_collection](https://www.instagram.com/prestige_et_collection/),
choisir une publication, clic droit sur l'image → « Enregistrer l'image sous… »,
puis renommer le fichier selon le tableau ci-dessus et le déposer dans ce dossier.

**Méthode groupée (tout télécharger d'un coup)** — lancer le script fourni :

```bash
bash outils/recuperer-photos-instagram.sh
```

Il télécharge toutes les photos du compte dans un dossier local ; il ne reste
qu'à choisir les 8 meilleures et à les renommer.

## Bon à savoir

- **Formats** : n'importe quelles dimensions conviennent (le site recadre
  automatiquement en 3:2, et 16:10 pour `hero.jpg`) ; visez au moins 1200 px de large.
- **Poids** : pour un site rapide, compressez les photos (par ex. [squoosh.app](https://squoosh.app),
  qualité ~80) — idéalement moins de 300 Ko par image.
- **Droits** : utilisez uniquement des photos dont le musée détient les droits
  (celles de son propre compte Instagram en font partie).
- Les visuels provisoires de ce dossier peuvent être écrasés sans regret :
  ils sont regénérables et ne servent qu'à montrer les emplacements.
