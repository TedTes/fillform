#!/usr/bin/env python3
"""
Simple runner for fill_acord.py (ACORD 126 only for now)

Usage:
    python run_fill.py ./acord_samples/ACORD_126_sample.json
"""

import os
import sys
import subprocess

def main():
    if len(sys.argv) != 2:
        print("Usage: python run_fill.py <ACORD_sample.json>")
        sys.exit(1)

    data_file = sys.argv[1]
    if not os.path.exists(data_file):
        print(f"❌ File not found: {data_file}")
        sys.exit(1)

    # Detect form type (125, 126, 140)
    form_type = None
    for fnum in ["125", "126", "140"]:
        if fnum in os.path.basename(data_file):
            form_type = fnum
            break

    if not form_type:
        print("❌ Could not detect form type from filename (must contain 125, 126, or 140).")
        sys.exit(1)

    # Paths
    template = f"./templates/ACORD_{form_type}.pdf"
    output_dir = "./filled"
    os.makedirs(output_dir, exist_ok=True)
    output = os.path.join(output_dir, f"ACORD_{form_type}_filled.pdf")

    if not os.path.exists(template):
        print(f"⚠️  Missing template file: {template}")
        print("Please place your blank ACORD PDF in ./templates/")
        sys.exit(1)

    # Run the filler (no --form)
    cmd = [
        sys.executable,
        "fill_acord.py",

        "--data", data_file,
        "--template", template,
        "--out", output
    ]

    print(f"🚀 Filling ACORD {form_type} using {data_file}...")
    subprocess.run(cmd, check=False)
    print(f"✅ Done! Output saved to: {output}\n")

if __name__ == "__main__":
    main()
