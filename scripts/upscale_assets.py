#!/usr/bin/env python3
"""
upscale_assets.py — 3× nearest-neighbor upscale pipeline for Ninja Adventure assets.

Scales all PNG files from 16×16px (Ninja Adventure source) to 48×48px
(Cloud Quest CONFIG.TILE_SIZE = 48). Uses nearest-neighbor interpolation
only — no anti-aliasing, no bilinear smoothing. Preserves alpha channel.
Strips embedded ICC profiles from source PNGs to avoid colour-space warnings.

Usage:
    python scripts/upscale_assets.py \\
        --input  ./ninja-adventure-raw/ \\
        --output ./assets/ \\
        --scale  3

The input tree is walked recursively. Each PNG is written to a mirrored
subdirectory under --output with the same relative path.

Asset categories are inferred from the first path component under --input:

    characters/   monsters/   tiles/   items/   effects/   ui/

Any directory name not in that list is counted under "other".

Exit codes:
    0 — success (at least one file processed)
    1 — no PNG files found under --input
    2 — import error (Pillow not installed)
"""

import argparse
import os
import sys

try:
    from PIL import Image
except ImportError:
    print(
        "ERROR: Pillow is not installed.\n"
        "Install it with:  pip install Pillow",
        file=sys.stderr,
    )
    sys.exit(2)

KNOWN_CATEGORIES = {"characters", "monsters", "tiles", "items", "effects", "ui"}


def upscale_png(src_path: str, dst_path: str, scale: int) -> None:
    """Upscale a single PNG with nearest-neighbor interpolation.

    Strips any embedded ICC profile so output PNGs are profile-free.
    Preserves the full alpha channel (RGBA).
    """
    with Image.open(src_path) as img:
        # Strip ICC profile by converting to a fresh RGBA image without info.
        # This also normalises palette, greyscale, and other modes to RGBA,
        # preserving full transparency regardless of the source mode.
        if img.mode != "RGBA":
            img = img.convert("RGBA")

        new_w = img.width * scale
        new_h = img.height * scale
        upscaled = img.resize((new_w, new_h), Image.NEAREST)

    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    # Save without icc_profile key — Pillow will not embed one
    upscaled.save(dst_path, format="PNG", optimize=False)


def infer_category(rel_path: str) -> str:
    """Return the asset category from the first component of a relative path."""
    parts = rel_path.replace("\\", "/").split("/")
    first = parts[0].lower() if parts else "other"
    return first if first in KNOWN_CATEGORIES else "other"


def process_directory(input_dir: str, output_dir: str, scale: int) -> dict:
    """Walk input_dir, upscale every PNG, write to output_dir.

    Returns a manifest dict:  { category: count }
    """
    manifest: dict[str, int] = {}
    found = False

    for dirpath, _dirnames, filenames in os.walk(input_dir):
        for filename in filenames:
            if not filename.lower().endswith(".png"):
                continue

            found = True
            src_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(src_path, input_dir)
            dst_path = os.path.join(output_dir, rel_path)

            category = infer_category(rel_path)
            manifest[category] = manifest.get(category, 0) + 1

            upscale_png(src_path, dst_path, scale)
            print(f"  {rel_path}")

    if not found:
        return {}

    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(
        description="3× nearest-neighbor upscale pipeline for Ninja Adventure assets.",
    )
    parser.add_argument(
        "--input",
        required=True,
        metavar="DIR",
        help="Root directory of raw Ninja Adventure assets.",
    )
    parser.add_argument(
        "--output",
        required=True,
        metavar="DIR",
        help="Root output directory (assets/ subfolders are created automatically).",
    )
    parser.add_argument(
        "--scale",
        type=int,
        default=3,
        metavar="N",
        help="Integer scale factor (default: 3 → 16px → 48px).",
    )
    args = parser.parse_args()

    input_dir = os.path.abspath(args.input)
    output_dir = os.path.abspath(args.output)
    scale = args.scale

    if not os.path.isdir(input_dir):
        print(f"ERROR: input directory not found: {input_dir}", file=sys.stderr)
        sys.exit(1)

    if scale < 1:
        print(f"ERROR: --scale must be a positive integer, got {scale}", file=sys.stderr)
        sys.exit(1)

    print(f"Upscaling assets {scale}× (nearest-neighbor)")
    print(f"  Input  : {input_dir}")
    print(f"  Output : {output_dir}")
    print()

    manifest = process_directory(input_dir, output_dir, scale)

    if not manifest:
        print("ERROR: no PNG files found under input directory.", file=sys.stderr)
        sys.exit(1)

    total = sum(manifest.values())
    print()
    print("── Manifest ──────────────────────────────")
    for category in sorted(manifest):
        print(f"  {category:<16} {manifest[category]:>4} file(s)")
    print(f"  {'TOTAL':<16} {total:>4} file(s)")
    print("──────────────────────────────────────────")
    print(f"\nDone — {total} PNG(s) upscaled {scale}× → written to {output_dir}")


if __name__ == "__main__":
    main()
