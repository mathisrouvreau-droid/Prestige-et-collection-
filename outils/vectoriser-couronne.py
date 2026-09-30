#!/usr/bin/env python3
"""Vectorise la couronne du logo Ô Sublime en pièces animables (tiges + feuilles).

Produit :
  assets/js/wreath.js           source unique du mouvement (héros, rideau, pied de page)
  assets/img/logo-couronne.svg  version vectorielle autonome

À relancer si le fichier du logo change :
  pip install pillow numpy scipy potracer
  python3 outils/vectoriser-couronne.py                       # utilise assets/img/logo.png
  python3 outils/vectoriser-couronne.py --source mon-logo.png

Le logo doit montrer la couronne dorée au-dessus du texte, sur fond clair. La couronne est
détectée automatiquement (les grands ensembles de pixels dorés) ; le texte noir et le
sous-titre doré, trop petits, sont ignorés.
"""
import argparse, math, os
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi
import potrace

ROOT = Path(__file__).resolve().parent.parent
SIZE = 282.0            # côté de la boîte carrée (unités du viewBox)
TARGET = 1100           # taille visée, en pixels, de la couronne avant tracé (précision des courbes)

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("--source", default=str(ROOT / "assets/img/logo.png"), help="fichier du logo complet")
ap.add_argument("--gold", default="#B08C43", help="or de la couronne (remplissage du SVG)")
args = ap.parse_args()

im = Image.open(args.source).convert("RGB")
a0 = np.asarray(im).astype(np.int16)

# 1. Repérage de la couronne : pixels dorés (rouge nettement > bleu), grands ensembles seulement
gold0 = (a0[..., 2] < 165) & ((a0[..., 0] - a0[..., 2]) > 40)
lab0, n0 = ndi.label(gold0, structure=np.ones((3, 3)))
if n0 == 0:
    raise SystemExit("Aucun pixel doré trouvé : ce fichier ressemble-t-il bien au logo ?")
sizes0 = ndi.sum(gold0, lab0, index=np.arange(1, n0 + 1))
big = [k + 1 for k, s in enumerate(sizes0) if s >= 0.25 * sizes0.max()]
ys, xs = np.nonzero(np.isin(lab0, big))
pad = 6
box = (max(0, xs.min() - pad), max(0, ys.min() - pad), min(im.width, xs.max() + pad + 1), min(im.height, ys.max() + pad + 1))
side = max(box[2] - box[0], box[3] - box[1])
print("couronne repérée :", box, "·", len(big), "bras")

# 2. Sur-échantillonnage et masque
UP = max(2, round(TARGET / side))
crop = im.crop(box)
big_im = crop.resize((crop.width * UP, crop.height * UP), Image.LANCZOS)
arr = np.asarray(big_im).astype(np.int16)
mask = (arr[..., 2] < 161) & ((arr[..., 0] - arr[..., 2]) > 30)
lab, n = ndi.label(mask, structure=np.ones((3, 3)))
areas = ndi.sum(mask, lab, index=np.arange(1, n + 1))
arms = [k + 1 for k, s in enumerate(areas) if s >= 0.25 * areas.max()]

# rayons morphologiques proportionnels à la taille de la couronne (réglés sur une couronne de ~266 px)
kscale = (side / 266.0) * UP
R_OPEN, R_GROW, R_SEAM = 3.4 * kscale, 5.6 * kscale, 1.2 * kscale

ys, xs = np.nonzero(np.isin(lab, arms))
x0, x1, y0, y1 = xs.min() / UP, xs.max() / UP, ys.min() / UP, ys.max() / UP
scale = (SIZE - 16) / max(x1 - x0, y1 - y0)         # la couronne occupe la boîte avec 8 unités de marge
ox = (SIZE - (x1 - x0) * scale) / 2 - x0 * scale
oy = (SIZE - (y1 - y0) * scale) / 2 - y0 * scale


def fmt(v):
    s = ("%.1f" % v).rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def P(p):
    return (p.x / UP * scale + ox, p.y / UP * scale + oy)


def curve_to_d(curve):
    sx, sy = P(curve.start_point)
    out = ["M%s %s" % (fmt(sx), fmt(sy))]
    for seg in curve.segments:
        ex, ey = P(seg.end_point)
        if seg.is_corner:
            cx, cy = P(seg.c)
            out.append("L%s %s L%s %s" % (fmt(cx), fmt(cy), fmt(ex), fmt(ey)))
        else:
            c1, c2 = P(seg.c1), P(seg.c2)
            out.append("C%s %s %s %s %s %s" % (fmt(c1[0]), fmt(c1[1]), fmt(c2[0]), fmt(c2[1]), fmt(ex), fmt(ey)))
    out.append("Z")
    return "".join(out)


def trace(m):
    # potracer : le premier plan est la valeur 0 → on passe le masque inversé
    return "".join(curve_to_d(c) for c in potrace.Bitmap(~m).trace(turdsize=12, alphamax=1.05, opticurve=True, opttolerance=0.5))


def within(m, r):
    """Pixels à distance ≤ r de l'ensemble m (dilatation par un disque)."""
    return ndi.distance_transform_edt(~m) <= r


parts = []
for arm_id in arms:
    arm = lab == arm_id
    core = ndi.distance_transform_edt(arm) >= R_OPEN          # érosion : les tiges (fines) disparaissent
    core = within(core, R_OPEN)                                # dilatation → ouverture morphologique
    leaves = within(core, R_GROW) & arm                        # les pointes de feuille sont restituées
    lab_l, nl = ndi.label(leaves, structure=np.ones((3, 3)))
    stem_all = arm & ~leaves
    lab_s, ns = ndi.label(stem_all, structure=np.ones((3, 3)))
    sizes = ndi.sum(stem_all, lab_s, index=np.arange(1, ns + 1))
    stem_main = np.isin(lab_s, [k + 1 for k, s in enumerate(sizes) if s >= 60 * kscale * kscale])
    dist_to_stem = ndi.distance_transform_edt(~stem_main)

    parts.append(dict(k="s", m=within(stem_all, R_SEAM) & arm, cm=ndi.center_of_mass(stem_all)))
    for j in range(1, nl + 1):
        lm = lab_l == j
        if lm.sum() < 40 * kscale * kscale:
            continue
        yy, xx = np.nonzero(lm)
        dmin = dist_to_stem[lm].min()
        by, bx = np.nonzero(lm & (dist_to_stem <= dmin + 2))
        parts.append(dict(k="l", m=within(lm, R_SEAM) & arm, cm=(yy.mean(), xx.mean()), base=(bx.mean(), by.mean())))

out = []
for p in parts:
    cy, cx = p["cm"]
    cxs, cys = cx / UP * scale + ox, cy / UP * scale + oy
    ang = (math.degrees(math.atan2(cxs - SIZE / 2, -(cys - SIZE / 2))) + 360) % 360
    item = dict(k=p["k"], a=round(ang, 1), r=round(math.hypot(cxs - SIZE / 2, cys - SIZE / 2), 1), d=trace(p["m"]))
    if p["k"] == "l":
        yy, xx = np.nonzero(p["m"])
        item["bx"] = round(p["base"][0] / UP * scale + ox, 1)
        item["by"] = round(p["base"][1] / UP * scale + oy, 1)
        # boîte englobante : les rotations / zooms de chaque feuille s'expriment en pourcentages de
        # cette boîte (transform-box: fill-box), indépendants de l'échelle d'affichage — fiable sur Safari
        item["x0"], item["x1"] = round(xx.min() / UP * scale + ox, 1), round((xx.max() + 1) / UP * scale + ox, 1)
        item["y0"], item["y1"] = round(yy.min() / UP * scale + oy, 1), round((yy.max() + 1) / UP * scale + oy, 1)
    out.append(item)

# ordre d'éclosion : les tiges s'enroulent d'abord (sens horaire), puis les feuilles éclosent en balayage horaire
stems = sorted([o for o in out if o["k"] == "s"], key=lambda o: o["a"])
leaves = sorted([o for o in out if o["k"] == "l"], key=lambda o: (o["a"] / 360.0) + 0.0012 * o["r"])
for i, o in enumerate(stems): o["i"] = i
for i, o in enumerate(leaves): o["i"] = i
parts = stems + leaves
print("pièces : %d tiges + %d feuilles · %d octets de tracé" % (len(stems), len(leaves), sum(len(o["d"]) for o in parts)))


def item_js(o):
    base = ",bx:%s,by:%s,x0:%s,y0:%s,x1:%s,y1:%s" % (o["bx"], o["by"], o["x0"], o["y0"], o["x1"], o["y1"]) if o["k"] == "l" else ""
    return '{k:"%s",i:%d,a:%s,r:%s%s,d:"%s"}' % (o["k"], o["i"], o["a"], o["r"], base, o["d"])


js = ("/* Couronne du logo Ô Sublime, vectorisée d'après le fichier source du logo :\n"
      "   %d tiges + %d feuilles, chacune un tracé indépendant (pour l'éclosion animée).\n"
      "   Générée par outils/vectoriser-couronne.py — ne pas éditer à la main. */\n" % (len(stems), len(leaves)))
js += "window.OS_WREATH = {size: %d, gold: \"%s\", parts: [\n" % (SIZE, args.gold)
js += ",\n".join(item_js(o) for o in parts) + "\n]};\n"
(ROOT / "assets/js").mkdir(parents=True, exist_ok=True)
(ROOT / "assets/js/wreath.js").write_text(js, encoding="utf8")

svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">\n' % (SIZE, SIZE, SIZE, SIZE)
svg += '<g fill="%s" fill-rule="evenodd">\n' % args.gold
svg += "\n".join('<path d="%s"/>' % o["d"] for o in parts) + "\n</g>\n</svg>\n"
(ROOT / "assets/img/logo-couronne.svg").write_text(svg, encoding="utf8")
print("écrits : assets/js/wreath.js, assets/img/logo-couronne.svg")
