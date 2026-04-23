#!/usr/bin/env python3
"""
Script d'optimisation d'images pour Paysage Dupont (et futurs clients).

USAGE:
  python3 scripts/optimize-images.py

CE QUE LE SCRIPT FAIT:
  1. Prend toutes les images JPG/PNG du dossier img/originals/
  2. Les redimensionne en 3 tailles : 400w, 800w, 1200w
  3. Les convertit en WebP (qualite 80) + JPEG fallback (qualite 82)
  4. Les enregistre dans img/ prets pour le site

CONVENTION DE NOMMAGE:
  img/originals/before-jardin.jpg
  => img/before-jardin-400w.webp
  => img/before-jardin-800w.webp
  => img/before-jardin-1200w.webp
  => img/before-jardin-800w.jpg  (fallback)

PROCESS POUR UN NOUVEAU CLIENT:
  1. Le client fournit ses photos (n'importe quelle taille/format)
  2. Tu les mets dans img/originals/ avec le bon nom:
     - before-jardin.jpg, after-jardin.jpg
     - before-terrasse.jpg, after-terrasse.jpg
     - before-allee.jpg, after-allee.jpg
  3. Tu lances: python3 scripts/optimize-images.py
  4. C'est fait. Le HTML n'a pas besoin de changer.
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERREUR: Pillow requis. Installe avec: pip3 install Pillow")
    sys.exit(1)

# Config
ORIGINALS_DIR = Path(__file__).parent.parent / "img" / "originals"
OUTPUT_DIR = Path(__file__).parent.parent / "img"
SIZES = [400, 800, 1200]
WEBP_QUALITY = 80
JPEG_QUALITY = 82
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def optimize_image(input_path, output_dir, sizes, webp_q, jpeg_q):
    """Redimensionne et convertit une image en WebP + JPEG fallback."""
    stem = input_path.stem  # ex: "before-jardin"

    with Image.open(input_path) as img:
        # Convertir en RGB si necessaire (ex: PNG avec alpha)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        orig_w, orig_h = img.size
        aspect = orig_h / orig_w

        for w in sizes:
            if w > orig_w:
                w = orig_w  # Ne pas agrandir

            h = int(w * aspect)
            resized = img.resize((w, h), Image.LANCZOS)

            # WebP
            webp_path = output_dir / f"{stem}-{w}w.webp"
            resized.save(webp_path, "WEBP", quality=webp_q, method=6)
            webp_size = webp_path.stat().st_size / 1024

            # JPEG fallback (seulement 800w)
            if w == 800:
                jpg_path = output_dir / f"{stem}-{w}w.jpg"
                resized.save(jpg_path, "JPEG", quality=jpeg_q, optimize=True)
                jpg_size = jpg_path.stat().st_size / 1024
                print(f"  {stem}-{w}w.jpg  -> {jpg_size:.0f} Ko")

            print(f"  {stem}-{w}w.webp -> {webp_size:.0f} Ko")


def main():
    if not ORIGINALS_DIR.exists():
        ORIGINALS_DIR.mkdir(parents=True)
        print(f"Dossier cree: {ORIGINALS_DIR}")
        print("Place tes images originales dedans puis relance le script.")
        return

    images = [
        f for f in ORIGINALS_DIR.iterdir()
        if f.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    if not images:
        print(f"Aucune image trouvee dans {ORIGINALS_DIR}")
        print("Noms attendus: before-jardin.jpg, after-jardin.jpg, etc.")
        return

    print(f"Traitement de {len(images)} images...\n")

    total_original = 0
    total_output = 0

    for img_path in sorted(images):
        orig_size = img_path.stat().st_size / 1024
        total_original += orig_size
        print(f"{img_path.name} ({orig_size:.0f} Ko original)")
        optimize_image(img_path, OUTPUT_DIR, SIZES, WEBP_QUALITY, JPEG_QUALITY)
        print()

    # Calculer taille totale des outputs
    for f in OUTPUT_DIR.iterdir():
        if f.stem.endswith(("400w", "800w", "1200w")):
            total_output += f.stat().st_size / 1024

    print(f"RESULTAT:")
    print(f"  Originaux:  {total_original:.0f} Ko")
    print(f"  Optimises:  {total_output:.0f} Ko")
    print(f"  Reduction:  {(1 - total_output/total_original)*100:.0f}%")


if __name__ == "__main__":
    main()
