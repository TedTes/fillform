#!/usr/bin/env python3
"""
Fill ACORD PDFs from JSON payloads using a mapping layer.

Usage examples:
  python fill_acord.py --form 125 --data /path/ACORD_125_sample.json \
    --template /path/blank/ACORD_125.pdf --out /path/out/ACORD_125_filled.pdf

  python fill_acord.py --form 126 --data /path/ACORD_126_sample.json \
    --template /path/blank/ACORD_126.pdf --out /path/out/ACORD_126_filled.pdf

  python fill_acord.py --form 140 --data /path/ACORD_140_sample.json \
    --template /path/blank/ACORD_140.pdf --out /path/out/ACORD_140_filled.pdf
"""

import argparse
import json
import os
from typing import Any, Dict, Optional

# --- PDF libraries ---
# pypdf (a maintained fork of PyPDF2) works well. If you use PyPDF2, import from PyPDF2 instead.
try:
    from pypdf import PdfReader, PdfWriter
except Exception:
    from PyPDF2 import PdfReader, PdfWriter  # fallback

# --- Optional: use your mapping utilities if available ---
USE_EXT_MAPPING = False
try:
    # If you created the improved mapping module as suggested earlier:
    # from app.infrastructure.pdf.acord_field_mappings_mvp import get_mapping, resolve_field_name, on_value, format_hint
    from acord_field_mappings import get_mapping, resolve_field_name, on_value, format_hint  # adjust path as needed
    USE_EXT_MAPPING = True
except Exception:
    pass


# -----------------------------
# Minimal inline mappings (fallback for demo)
# -----------------------------
def _fallback_mapping(form_type: str) -> Dict[str, Any]:
    """Very small inline mapping so the script can run a demo even without your mapping module."""
    if form_type == "125":
        return {
            "type": "acroform",
            "field_map": {
                "named_insured": "NamedInsured",
                "applicant_name": "ApplicantName",
                "insured_address": "MailingAddress",
                "producer_name": "ProducerName",
                "producer_address": "ProducerAddress",
                "effective_date": "EffectiveDate",
                "expiration_date": "ExpirationDate",
                "policy_number": "PolicyNumber",
                "business_description": "BusinessDescription",
                "annual_revenue": "AnnualRevenue",
                "num_employees": "NumberOfEmployees",
                "prior_carrier": "PriorCarrier",
                "prior_premium": "PriorPremium",
                "loss_history": "Remarks",  # simple place to drop a note
                "insurance_company": "CompanyName",
                "policy_type": "PolicyType",
                "producer_phone": "ProducerPhone",
            },
            "checkbox_on": {},
            "formats": {
                "effective_date": "date:mm/dd/yyyy",
                "expiration_date": "date:mm/dd/yyyy",
                "annual_revenue": "money:$#,###",
                "prior_premium": "money:$#,###",
            },
        }
    if form_type == "126":
        return {
            "type": "acroform",
            "field_map": {
                # Limits
                "limits.each_occurrence": "EachOccurrence",
                "limits.general_aggregate": "GeneralAggregate",
                "limits.products_agg": "ProductsAggregate",
                "limits.personal_adv_injury": "PersonalInjury",
                "limits.medical_expense": "MedicalExpense",
                "limits.fire_damage": "DamageToPremises",
                # Ops / remarks
                "ops.hazards_desc": "Remarks",
                "ops.subcontractors": "GeneralLiabilityLineOfBusiness_RemarkText_A",
                "ops.products_sold": "GeneralLiabilityLineOfBusiness_RemarkText_B",
                # Retro (claims-made)
                "claims_made.retro_date": "ClaimsMadeRetroDate",
                # AI
                "additional_insureds": "AdditionalInsuredName_A",
            },
            "checkbox_on": {},
            "formats": {
                "limits.each_occurrence": "money:$#,###",
                "limits.general_aggregate": "money:$#,###",
                "limits.products_agg": "money:$#,###",
                "limits.personal_adv_injury": "money:$#,###",
                "limits.medical_expense": "money:$#,###",
                "limits.fire_damage": "money:$#,###",
                "claims_made.retro_date": "date:mm/dd/yyyy",
            },
        }
    if form_type == "140":
        return {
            "type": "acroform",
            "field_map": {
                "location.address": "LocationAddress1",
                "building.description": "BuildingDescription1",
                "building.year_built": "YearBuilt1",
                "building.construction_type": "ConstructionType1",
                "building.total_area": "TotalAreaSqFt1",
                "building.stories": "NumberOfStories1",
                "building.percent_sprinklered": "PercentSprinklered1",
                "building.alarm_systems": "AlarmSystems1",
                "coverage.replacement_cost": "BuildingLimit1",
                "coverage.bpp": "ContentsLimit1",
                "coverage.coinsurance": "Coinsurance1",
                "coverage.deductible": "Deductible1",
                "mortgagee.name": "MortgageeName1",
                "mortgagee.loan": "MortgageeLoanNumber1",
            },
            "checkbox_on": {},
            "formats": {
                "building.year_built": "number:#",
                "building.total_area": "number:#,###",
                "coverage.replacement_cost": "money:$#,###",
                "coverage.bpp": "money:$#,###",
                "coverage.coinsurance": "percent:#%",
            },
        }
    raise ValueError(f"No fallback mapping for form {form_type}")


# -----------------------------
# Helpers: formatting & traversal
# -----------------------------
def _format_value(val: Any, hint: Optional[str]) -> str:
    """Format dates/money/percent roughly based on a hint. Keep simple for MVP."""
    if val is None:
        return ""
    if not hint:
        return str(val)

    try:
        kind, spec = hint.split(":", 1)
    except ValueError:
        kind, spec = hint, ""

    s = str(val)

    if kind == "date":
        # Expect yyyy-mm-dd; output mm/dd/yyyy
        # Accept 'YYYY-MM-DD' or already 'MM/DD/YYYY'
        if "-" in s and len(s) >= 10:
            y, m, d = s[:10].split("-")
            return f"{m}/{d}/{y}"
        return s
    if kind == "money":
        try:
            n = float(val)
            return f"${n:,.0f}" if ".#" not in spec else f"${n:,.2f}"
        except Exception:
            return s
    if kind == "number":
        try:
            n = float(val)
            if "#,###" in spec:
                return f"{n:,.0f}"
            if "#.###" in spec:
                return f"{n:.3f}"
            return f"{n:g}"
        except Exception:
            return s
    if kind == "percent":
        try:
            n = float(val)
            return f"{int(n)}%" if n == int(n) else f"{n:.0f}%"
        except Exception:
            return s

    return s


def _deep_get(obj: Dict[str, Any], dotted: str) -> Any:
    """Get nested value by dot path (no arrays here in MVP fallback)."""
    cur = obj
    for part in dotted.split("."):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            return None
    return cur


# -----------------------------
# Core: fill AcroForm
# -----------------------------
def _set_need_appearances(writer: PdfWriter) -> None:
    """Ask viewer to regenerate appearances (helps when not explicitly flattened)."""
    try:
        if "/AcroForm" in writer._root_object:
            writer._root_object["/AcroForm"].update({"/NeedAppearances": True})
        else:
            from pypdf.generic import DictionaryObject, NameObject, BooleanObject  # type: ignore
            writer._root_object.update({
                NameObject("/AcroForm"): DictionaryObject({NameObject("/NeedAppearances"): BooleanObject(True)})
            })
    except Exception:
        pass


def fill_acroform(template_pdf: str, out_pdf: str,
                  form_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fill an AcroForm-based PDF using either external mapping utilities or the fallback map.
    Returns a report dict with counts and any warnings.
    """
    report = {"written": 0, "skipped": [], "unknown_pdf_fields": [], "notes": []}

    # Load mapping
    if USE_EXT_MAPPING:
        m = get_mapping(form_type)  # your richer mapping
        fmap = m.get("field_map", {})
        formats = m.get("formats", {})
        # use resolve_field_name if you have arrays; here we only resolve simple keys
        def resolve(canon_key: str) -> Optional[str]:
            return fmap.get(canon_key)
        def fmt_hint(canon_key: str) -> Optional[str]:
            return formats.get(canon_key)
        def on_val(canon_key: str) -> str:
            return m.get("checkbox_on", {}).get(canon_key, "/Yes")
    else:
        fm = _fallback_mapping(form_type)
        fmap = fm["field_map"]
        formats = fm.get("formats", {})
        resolve = lambda ck: fmap.get(ck)
        fmt_hint = lambda ck: formats.get(ck)
        on_val = lambda ck: "/Yes"

    # Open PDF
    reader = PdfReader(template_pdf)
    writer = PdfWriter()
    for p in reader.pages:
        writer.add_page(p)

    # Existing field set (for safety logs)
    try:
        fields = reader.get_fields() or {}
        existing_field_names = set(fields.keys())
    except Exception:
        existing_field_names = set()

    # Map JSON -> PDF fields
    for canon_key, pdf_key in fmap.items():
        pdf_field_name = resolve(canon_key)
        if not pdf_field_name:
            report["skipped"].append((canon_key, "no_mapping"))
            continue

        # get source value from JSON (try exact path, then dotted aliases for fallback mapping)
        src_val = None
        if USE_EXT_MAPPING:
            # if your canonical keys are dotted (e.g., "insured.name"), try deep get
            src_val = _deep_get(data, canon_key) or data.get(canon_key)
        else:
            # fallback: translate a few expected keys to the sample structure
            sample_map = {
                # 125
                "named_insured": ("named_insured",),
                "applicant_name": ("applicant.name",),
                "insured_address": ("applicant.address",),
                "producer_name": ("producer.name",),
                "producer_address": ("producer.address",),
                "effective_date": ("coverage.effective_date",),
                "expiration_date": ("coverage.expiration_date",),
                "policy_number": ("policy_number",),
                "business_description": ("applicant.business_description",),
                "annual_revenue": ("applicant.annual_revenue",),
                "num_employees": ("applicant.num_employees",),
                "prior_carrier": ("prior_insurance.carrier",),
                "prior_premium": ("prior_insurance.premium",),
                "loss_history": ("loss_history",),
                "insurance_company": ("insurance_company",),
                "policy_type": ("coverage.policy_type",),
                "producer_phone": ("producer.phone",),

                # 126
                "limits.each_occurrence": ("limits.each_occurrence",),
                "limits.general_aggregate": ("limits.general_aggregate",),
                "limits.products_agg": ("limits.products_completed_ops",),
                "limits.personal_adv_injury": ("limits.personal_adv_injury",),
                "limits.medical_expense": ("limits.medical_expense",),
                "limits.fire_damage": ("limits.fire_damage",),
                "ops.hazards_desc": ("operations.hazards_description",),
                "ops.subcontractors": ("operations.subcontractors_used",),
                "ops.products_sold": ("operations.products_sold",),
                "claims_made.retro_date": ("operations.retroactive_date",),
                "additional_insureds": ("additional_insureds",),

                # 140
                "location.address": ("location.address",),
                "building.description": ("location.building_description",),
                "building.year_built": ("location.year_built",),
                "building.construction_type": ("location.construction_type",),
                "building.total_area": ("location.total_area_sqft",),
                "building.stories": ("location.stories",),
                "building.percent_sprinklered": ("location.percent_sprinklered",),
                "building.alarm_systems": ("location.alarm_systems",),
                "coverage.replacement_cost": ("coverage.replacement_cost",),
                "coverage.bpp": ("coverage.business_personal_property",),
                "coverage.coinsurance": ("coverage.coinsurance_percent",),
                "coverage.deductible": ("coverage.deductible",),
                "mortgagee.name": ("mortgagee.name",),
                "mortgagee.loan": ("mortgagee.loan_number",),
            }
            for alias in sample_map.get(canon_key, (canon_key,)):
                v = _deep_get(data, alias)
                if v is not None:
                    src_val = v
                    break

        if src_val is None:
            report["skipped"].append((canon_key, "no_source_value"))
            continue

        # Format
        value = _format_value(src_val, fmt_hint(canon_key))

        # If the target field doesn't exist, log it (helps when PDF variants differ)
        if existing_field_names and pdf_field_name not in existing_field_names:
            report["unknown_pdf_fields"].append(pdf_field_name)
            # still attempt to set; some readers allow writing unnamed widget dicts

        # Write to AcroForm: writer.update_page_form_field_values(page, {name:value})
        # We need to set on every page because fields can be attached per-page.
        for i, page in enumerate(writer.pages):
            try:
                writer.update_page_form_field_values(page, {pdf_field_name: value})
            except Exception:
                # Some libs throw if the field isn't on that page; ignore and continue
                pass

        report["written"] += 1

    # Ask viewers to regenerate appearances (improves rendering)
    _set_need_appearances(writer)

    # Save
    with open(out_pdf, "wb") as f:
        writer.write(f)

    # Deduplicate logs
    report["unknown_pdf_fields"] = sorted(set(report["unknown_pdf_fields"]))
    return report


# -----------------------------
# CLI
# -----------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--form", required=True, choices=["125", "126", "140"], help="ACORD form number")
    ap.add_argument("--data", required=True, help="Path to input JSON payload")
    ap.add_argument("--template", required=True, help="Path to blank ACORD PDF")
    ap.add_argument("--out", required=True, help="Path to write filled PDF")
    args = ap.parse_args()

    with open(args.data, "r", encoding="utf-8") as f:
        payload = json.load(f)

    report = fill_acroform(args.template, args.out, args.form, payload)

    print("\n=== Fill Report ===")
    print(f"Written fields: {report['written']}")
    if report["skipped"]:
        print("Skipped mappings:")
        for k, reason in report["skipped"]:
            print(f"  - {k}: {reason}")
    if report["unknown_pdf_fields"]:
        print("Unknown PDF field names (not found in template):")
        for n in report["unknown_pdf_fields"]:
            print(f"  - {n}")
    print(f"Output: {args.out}\n")


if __name__ == "__main__":
    main()
