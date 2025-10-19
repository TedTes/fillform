#!/usr/bin/env python3
"""
Fill ACORD 126 PDF from a JSON payload using a mapping layer.

Example:
  python fill_acord.py \
    --data ./ACORD_126_sample.json \
    --template ./ACORD_126.pdf \
    --out ./ACORD_126_filled.pdf
"""

import argparse
import json
import sys
from typing import Any, Dict, Optional

# PDF libs
try:
    from pypdf import PdfReader, PdfWriter
    from pypdf.generic import NameObject, DictionaryObject, BooleanObject
except ImportError:
    print("Error: pypdf is required. Install it with 'pip install pypdf'.")
    sys.exit(1)

# Mapping (126 only)
from acord_field_mappings import get_field_mapping

# -----------------------------
# Helpers: formatting & traversal
# -----------------------------
def _format_value(val: Any, hint: Optional[str]) -> str:
    """Format dates/money/percent roughly based on a hint. Keep simple for MVP."""
    if val is None:
        return ""
    if not hint:
        return str(val)

    s = str(val)
    kind, _, spec = hint.partition(":")

    if kind == "date":
        # Accept 'YYYY-MM-DD' -> 'MM/DD/YYYY'; otherwise return as-is
        if "-" in s and len(s) >= 10:
            try:
                y, m, d = s[:10].split("-")
                return f"{m}/{d}/{y}"
            except Exception:
                return s
        return s
    if kind == "money":
        try:
            n = float(val)
            return f"${n:,.0f}"
        except Exception:
            return s
    return s

def _deep_get(obj: Dict[str, Any], dotted: str) -> Any:
    """
    Get nested value by dotted path with optional array indices, e.g.:
      'additional_insureds[0].name'
    """
    cur: Any = obj
    for part in dotted.split("."):
        # handle indexes like 'foo[0]'
        while True:
            if "[" in part and part.endswith("]"):
                key, idx_str = part[:part.index("[")], part[part.index("[")+1:-1]
                if not isinstance(cur, dict) or key not in cur:
                    return None
                cur = cur[key]
                try:
                    idx = int(idx_str)
                except Exception:
                    return None
                if not isinstance(cur, list) or idx >= len(cur):
                    return None
                cur = cur[idx]
                # remove one bracket level and continue if nested (e.g., a[0][1])
                open_brack = part.find("[", part.index("[")+1)
                if open_brack == -1:
                    break
                part = part[open_brack:]  # proceed to next bracket level in same token
            else:
                # plain dict hop
                if isinstance(cur, dict) and part in cur:
                    cur = cur[part]
                else:
                    return None
                break
    return cur

# Checkbox “on” value helper
def _checkbox_on_value(field_name: str, reader: PdfReader) -> str:
    fields = reader.get_fields()
    if fields and field_name in fields:
        ap = fields[field_name].get('/AP')
        if ap and '/N' in ap:
            return list(ap['/N'].keys())[0]  # Use the first appearance state
    return '/Yes'  # Fallback

def _set_need_appearances(writer: PdfWriter) -> None:
    """Ask viewer to regenerate appearances (helps when not explicitly flattened)."""
    try:
        catalog = writer._root_object
        if "/AcroForm" not in catalog:
            catalog[NameObject("/AcroForm")] = DictionaryObject()
        catalog["/AcroForm"].update({NameObject("/NeedAppearances"): BooleanObject(True)})
    except Exception as e:
        print(f"Warning: Failed to set NeedAppearances: {e}")

# -----------------------------
# Core
# -----------------------------
def fill_acord_126(template_pdf: str, out_pdf: str, data: Dict[str, Any]) -> Dict[str, Any]:
    reader = PdfReader(template_pdf)
    fields = reader.get_fields()
    if fields:
        print("PDF Field Names:")
        for field_name, field in fields.items():
            print(f"  {field_name}: {field.get('/FT')} (Type), {field.get('/V')} (Value), {field.get('/AP')} (Appearance)")
    else:
        print("Warning: No fields found in PDF! The template may not be fillable.")

    """
    Fill ACORD 126 using the mapping.
    Returns a report dict with counts and any warnings.
    """
    report = {"written": 0, "skipped": [], "unknown_pdf_fields": [], "notes": []}
    fmap = get_field_mapping("126")

    # Optional formatting hints for a few keys
    format_hints = {
        "claims_made.retro_date": "date:mm/dd/yyyy",
        "limits.each_occurrence": "money:$",
        "limits.general_aggregate": "money:$",
        "limits.products_completed_ops": "money:$",
        "limits.personal_adv_injury": "money:$",
        "limits.medical_expense": "money:$",
        "limits.fire_damage": "money:$",
    }

    # Open PDF
    reader = PdfReader(template_pdf)
    writer = PdfWriter()
    for p in reader.pages:
        writer.add_page(p)

    # Copy /AcroForm from reader to writer with pdf_dest
    try:
        if "/AcroForm" in reader.trailer["/Root"]:
            acro_form = reader.trailer["/Root"]["/AcroForm"]
            writer._root_object[NameObject("/AcroForm")] = acro_form.clone(writer)
            # Ensure fields are accessible
            if "/Fields" not in writer._root_object["/AcroForm"]:
                writer._root_object["/AcroForm"][NameObject("/Fields")] = acro_form.get("/Fields", [])
    except Exception as e:
        print(f"Error setting up /AcroForm: {e}")
        report["notes"].append(f"Failed to set up /AcroForm: {e}")

    # Get current field set (for logging)
    try:
        fields = reader.get_fields() or {}
        existing_field_names = set(fields.keys())
    except Exception as e:
        print(f"Error reading PDF fields: {e}")
        existing_field_names = set()

    # Map JSON -> PDF fields
    for canon_key, pdf_field_name in fmap.items():
        # 1) Find source value
        src_val = _deep_get(data, canon_key)
        if src_val is None:
            report["skipped"].append((canon_key, "no_source_value"))
            continue

        # 2) Checkbox or text?
        is_checkbox = pdf_field_name.endswith("_Indicator_A") or pdf_field_name.endswith("_Indicator_B") \
                      or "Indicator" in pdf_field_name

        # 3) Format value
        value = src_val
        if is_checkbox:
            truthy = {True, "true", "yes", "y", "on", "1", 1}
            val_norm = str(src_val).strip().lower()
            set_on = (src_val in truthy) or (val_norm in {"true", "yes", "y", "on", "1"})
            value = _checkbox_on_value(pdf_field_name, reader) if set_on else "Off"
        else:
            # Handle remarks concatenation
            if canon_key in ["operations.hazards_description", "operations.subcontractors_used"]:
                if pdf_field_name == "GeneralLiabilityLineOfBusiness_RemarkText_A":
                    haz = _deep_get(data, "operations.hazards_description") or ""
                    subs = _deep_get(data, "operations.subcontractors_used") or ""
                    value = f"{haz}; {subs}".strip("; ")
                    if haz and subs:
                        report["notes"].append(f"Combined {canon_key} into {pdf_field_name}")
            elif canon_key == "operations.products_sold" and pdf_field_name == "GeneralLiabilityLineOfBusiness_RemarkText_B":
                value = _deep_get(data, canon_key) or ""
            else:
                value = _format_value(src_val, format_hints.get(canon_key))

        # 4) Skip claims_made.retro_date if claims_made is not selected
        if canon_key == "claims_made.retro_date" and not _deep_get(data, "coverage_type.claims_made"):
            report["skipped"].append((canon_key, "claims_made_not_selected"))
            continue

        # 5) Warn if field not present in this template
        if existing_field_names and pdf_field_name not in existing_field_names:
            report["unknown_pdf_fields"].append(pdf_field_name)

        # 6) Write to all pages (some widgets are per-page)
        updated = False
        for page in writer.pages:
            try:
                writer.update_page_form_field_values(page, {pdf_field_name: value})
                updated = True
            except Exception as e:
                print(f"Error updating field {pdf_field_name}: {e}")
                break

        if updated:
            report["written"] += 1
        else:
            report["skipped"].append((canon_key, "failed_to_update"))

    # Ask viewers to regenerate appearances
    _set_need_appearances(writer)

    # Flatten the PDF using _flatten (private method, use with caution)
    try:
        writer._flatten()
    except AttributeError:
        print("Warning: Flattening not supported. Output may require viewer regeneration.")
        report["notes"].append("Flattening failed; fields may not be visible without viewer interaction.")

    # Save
    try:
        with open(out_pdf, "wb") as f:
            writer.write(f)
    except Exception as e:
        print(f"Error writing output PDF {out_pdf}: {e}")
        report["notes"].append(f"Failed to write PDF: {e}")
        return report

    # Dedup logs
    report["unknown_pdf_fields"] = sorted(set(report["unknown_pdf_fields"]))
    return report

# -----------------------------
# CLI
# -----------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True, help="Path to ACORD 126 input JSON payload")
    ap.add_argument("--template", required=True, help="Path to blank ACORD_126.pdf")
    ap.add_argument("--out", required=True, help="Path to write filled PDF")
    args = ap.parse_args()

    with open(args.data, "r", encoding="utf-8") as f:
        payload = json.load(f)

    report = fill_acord_126(args.template, args.out, payload)

    print("\n=== ACORD 126 Fill Report ===")
    print(f"Written fields: {report['written']}")
    if report["skipped"]:
        print("Skipped mappings:")
        for k, reason in report["skipped"]:
            print(f"  - {k}: {reason}")
    if report["unknown_pdf_fields"]:
        print("Unknown PDF field names (not found in template):")
        for n in report["unknown_pdf_fields"]:
            print(f"  - {n}")
    if report["notes"]:
        print("Notes:")
        for note in report["notes"]:
            print(f"  - {note}")
    print(f"Output: {args.out}\n")

if __name__ == "__main__":
    main()