#!/usr/bin/env bash
# Télécharge toutes les photos du compte Instagram @prestige_et_collection
# dans un dossier local, pour ensuite choisir et renommer les 8 photos du site
# (voir assets/img/photos/PHOTOS.md).
#
# À lancer sur votre ordinateur (nécessite Python 3) :
#   bash outils/recuperer-photos-instagram.sh
#
# Remarque : Instagram limite parfois le téléchargement anonyme. Si le script
# échoue, ajoutez  --login VOTRE_IDENTIFIANT_INSTAGRAM  à la dernière ligne,
# ou enregistrez les photos à la main depuis le site Instagram (clic droit).

set -euo pipefail

COMPTE="prestige_et_collection"
DOSSIER="photos-instagram"

if ! command -v instaloader >/dev/null 2>&1; then
  echo "Installation d'instaloader (outil libre de téléchargement Instagram)…"
  python3 -m pip install --user instaloader
  export PATH="$HOME/.local/bin:$PATH"
fi

mkdir -p "$DOSSIER"
instaloader \
  --dirname-pattern="$DOSSIER" \
  --no-videos --no-video-thumbnails \
  --no-metadata-json --no-captions --no-compress-json \
  "$COMPTE"

echo
echo "✔ Photos téléchargées dans le dossier « $DOSSIER »."
echo "  Choisissez les 8 meilleures, renommez-les selon assets/img/photos/PHOTOS.md,"
echo "  puis déposez-les dans assets/img/photos/ (en écrasant les visuels provisoires)."
