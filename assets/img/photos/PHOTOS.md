# Photos du site — mode d'emploi

Le site est **prêt à recevoir les photos** : chaque emplacement affiche pour l'instant
un visuel provisoire qui indique le nom de fichier attendu. Il suffit de **remplacer
chaque fichier par la photo choisie, en gardant exactement le même nom** — aucune
modification du code n'est nécessaire.

## Les 9 emplacements

| Fichier            | Où il apparaît                                   | Photo idéale |
|--------------------|--------------------------------------------------|--------------|
| `hero.jpg`         | Accueil — grande image d'entrée (cadrage vertical) | La plus belle ambiance de l'institut : cabine, spa, matières |
| `spa-privatif.jpg` | Page spa — bandeau large sous le titre            | Vue d'ensemble de l'espace spa (cadrage horizontal) |
| `spa-jacuzzi.jpg`  | Accueil + page spa — tuile « Le jacuzzi »         | Le jacuzzi, eau en mouvement |
| `spa-sauna.jpg`    | Accueil + page spa — tuile « Le sauna infrarouge »| Le sauna, bois chaud et lumière |
| `spa-hammam.jpg`   | Accueil + page spa — tuile « Le hammam »          | Le hammam, vapeur et mosaïque |
| `soin-visage.jpg`  | Page soins — section « Soins du visage »          | Un soin visage en cabine, gestes des mains |
| `soin-corps.jpg`   | Page soins — section « Corps & massages »         | Un massage, huiles, serviettes |
| `soin-mains.jpg`   | Page soins — section « Mains & pieds »            | Manucure, vernis, détail des mains |
| `institut.jpg`     | Accueil + contact — infos pratiques               | La façade ou l'accueil de l'institut |

## Récupérer les photos existantes

Les photos de l'ancien site et des réseaux de l'institut sont les meilleures candidates
(vous en détenez les droits). Depuis un ordinateur **sur un réseau non filtré** :

**Méthode groupée** — lancer le script fourni, qui aspire les images de
[o-sublime.com](https://www.o-sublime.com) (et, en option, d'Instagram) :

```bash
bash outils/recuperer-photos.sh
```

Les images arrivent dans `photos-recuperees/` ; il ne reste qu'à choisir les 9
meilleures, les renommer selon le tableau ci-dessus et les déposer dans ce dossier.

**Méthode manuelle** — ouvrir [o-sublime.com](https://www.o-sublime.com) ou
[instagram.com/osublime.institutspa](https://www.instagram.com/osublime.institutspa/),
clic droit sur une image → « Enregistrer l'image sous… », renommer, déposer ici.

## Bon à savoir

- **Formats** : n'importe quelles dimensions conviennent — le site recadre
  automatiquement (4:5 pour `hero.jpg` et les sections de soins, 4:3 pour les tuiles,
  16:9 pour `spa-privatif.jpg`). Visez au moins 1200 px de large.
- **Poids** : pour un site rapide, compressez les photos (par ex. [squoosh.app](https://squoosh.app),
  qualité ~80) — idéalement moins de 300 Ko par image.
- **Droits** : utilisez uniquement des photos dont l'institut détient les droits
  (celles de son site et de ses comptes Instagram/Facebook en font partie).
- Les visuels provisoires de ce dossier peuvent être écrasés sans regret :
  ils ne servent qu'à montrer les emplacements.
