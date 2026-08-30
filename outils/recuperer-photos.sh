#!/usr/bin/env bash
# =============================================================================
# Récupère les photos de l'institut pour le nouveau site Ô Sublime.
#
#   bash outils/recuperer-photos.sh
#
# À lancer depuis un réseau NON filtré (chez vous, pas depuis l'environnement
# de développement Claude, où l'accès à o-sublime.com est bloqué).
#
# 1. Aspire les images de l'ancien site www.o-sublime.com (pages connues).
# 2. En option, télécharge les photos du compte Instagram de l'institut
#    (nécessite « instaloader » : pip install instaloader).
#
# Les images arrivent dans photos-recuperees/ ; choisissez ensuite les 9
# meilleures et renommez-les selon assets/img/photos/PHOTOS.md.
# =============================================================================
set -euo pipefail

SITE="https://www.o-sublime.com"
PAGES=(
  "/" "/spa/" "/escales-au-spa-avec-soins/" "/cartes-d-abonnement-au-spa/"
  "/privatisation-%C3%A9v%C3%A9nementielle/" "/soins-du-visage/" "/soins-du-corps/"
  "/epilations/" "/epilations-d%C3%A9finitives/" "/regard/"
  "/beaut%C3%A9-des-mains-et-des-pieds/" "/vernis-semi-permanent/" "/maquillage/"
  "/bronzage" "/soins-jeunes-et-ados/" "/carte-de-fid%C3%A9lit%C3%A9/"
)
DEST="photos-recuperees"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"

mkdir -p "$DEST/site"

echo "── 1. Images de l'ancien site ($SITE) ─────────────────────────────"
LISTE="$(mktemp)"
for page in "${PAGES[@]}"; do
  echo "   · page $page"
  curl -fsSL -A "$UA" "$SITE$page" 2>/dev/null |
    grep -Eoi '(src|href|content)="[^"]+\.(jpe?g|png|webp)[^"]*"' |
    sed -E 's/^[a-z]+="//i; s/"$//' >> "$LISTE" || true
done

# Normalise les URLs (relatives → absolues), déduplique, filtre les icônes.
sed -E "s#^//#https://#; s#^/#$SITE/#" "$LISTE" |
  grep -Ei '^https?://' |
  grep -Eiv '(favicon|sprite|logo-?tiers|\.svg)' |
  sort -u > "$LISTE.uniq"

NB=0
while IFS= read -r url; do
  nom="$(basename "${url%%\?*}")"
  [ -e "$DEST/site/$nom" ] && nom="$((RANDOM))-$nom"
  if curl -fsSL -A "$UA" "$url" -o "$DEST/site/$nom" 2>/dev/null; then
    NB=$((NB+1)); echo "   ✓ $nom"
  fi
done < "$LISTE.uniq"
rm -f "$LISTE" "$LISTE.uniq"
echo "   → $NB image(s) dans $DEST/site/"

echo
echo "── 2. Photos Instagram (@osublime.institutspa) — optionnel ───────"
if command -v instaloader >/dev/null 2>&1; then
  instaloader --no-videos --no-metadata-json --no-captions \
    --dirname-pattern "$DEST/instagram" osublime.institutspa || true
  echo "   → photos dans $DEST/instagram/"
else
  echo "   instaloader n'est pas installé — pour récupérer aussi Instagram :"
  echo "     pip install instaloader && bash outils/recuperer-photos.sh"
fi

echo
echo "── 3. Et maintenant ? ─────────────────────────────────────────────"
echo "   Choisissez les 9 meilleures images, renommez-les selon"
echo "   assets/img/photos/PHOTOS.md et déposez-les dans assets/img/photos/"
echo "   (en écrasant les visuels provisoires, mêmes noms de fichiers)."
