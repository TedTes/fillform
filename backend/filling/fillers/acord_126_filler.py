"""
ACORD 126 filler implementation.

Orchestrates the filling workflow for ACORD 126 PDFs:
1. Load template and data
2. Map JSON to PDF fields
3. Format and write values
4. Generate fill report
"""

import os
from typing import Dict, Any, Optional
from pypdf import PdfReader, PdfWriter
from ..interfaces.filler import IFiller
from ..interfaces.mapper import IMapper
from ..interfaces.writer import IPdfWriter
from ..mappers.acord_126_mapper import Acord126Mapper
from ..writers.pdf_field_writer import PdfFieldWriter
from ..utils.value_formatter import ValueFormatter
from utils.json_navigator import JsonNavigator


class Acord126Filler(IFiller):
    """
    Filler for ACORD 126 (Commercial General Liability Application).
    
    Coordinates:
    - Mapper: JSON → PDF field names
    - Writer: Low-level PDF operations
    - Formatter: Value formatting (dates, money, etc.)
    - Navigator: JSON traversal
    """
    
    # Format hints for specific fields
    FORMAT_HINTS = {
        "claims_made.retro_date": "date:mm/dd/yyyy",
        "limits.each_occurrence": "money:$",
        "limits.general_aggregate": "money:$",
        "limits.products_completed_ops": "money:$",
        "limits.personal_adv_injury": "money:$",
        "limits.medical_expense": "money:$",
        "limits.fire_damage": "money:$",
    }
    
    def __init__(
        self,
        mapper: IMapper = None,
        writer: IPdfWriter = None,
        formatter: ValueFormatter = None,
        navigator: JsonNavigator = None
    ):
        """
        Initialize filler with dependencies.
        
        Args:
            mapper: Field mapper (defaults to Acord126Mapper)
            writer: PDF writer (defaults to PdfFieldWriter)
            formatter: Value formatter (defaults to ValueFormatter)
            navigator: JSON navigator (defaults to JsonNavigator)
        """
        self.mapper = mapper or Acord126Mapper()
        self.writer = writer or PdfFieldWriter()
        self.formatter = formatter or ValueFormatter()
        self.navigator = navigator or JsonNavigator()
    
    def get_supported_form_type(self) -> str:
        """Return form type this filler supports."""
        return "126"
    
    def fill(self, template_path: str, data: Dict[str, Any], output_path: str) -> Dict[str, Any]:
        """
        Fill ACORD 126 PDF with data.
        
        Args:
            template_path: Path to blank ACORD 126 template
            data: Canonical JSON data
            output_path: Path where filled PDF should be saved
            
        Returns:
            Fill report dictionary with:
            - written: int (fields successfully written)
            - skipped: list (fields skipped with reasons)
            - unknown_pdf_fields: list (PDF fields not found)
            - notes: list (additional information)
        """
        # Validate inputs
        if not os.path.exists(template_path):
            raise FileNotFoundError(f"Template PDF not found: {template_path}")
        
        # Initialize report
        report = {
            "written": 0,
            "skipped": [],
            "unknown_pdf_fields": [],
            "notes": []
        }
        
        # Open PDF
        reader = PdfReader(template_path)
        writer = PdfWriter()
        
        # Copy pages
        for page in reader.pages:
            writer.add_page(page)
        
        # Setup AcroForm
        try:
            self.writer.setup_acro_form(reader, writer)
        except Exception as e:
            report["notes"].append(f"Failed to set up /AcroForm: {e}")
        
        # Get existing field names for validation
        try:
            fields = reader.get_fields() or {}
            existing_field_names = set(fields.keys())
        except Exception as e:
            print(f"Error reading PDF fields: {e}")
            existing_field_names = set()
        
        # Get all mappings
        field_mappings = self.mapper.get_all_mappings()
        
        # Process each mapping
        for json_key, pdf_field_name in field_mappings.items():
            # Get source value from JSON
            src_val = self.navigator.deep_get(data, json_key)
            
            if src_val is None:
                report["skipped"].append((json_key, "no_source_value"))
                continue
            
            # Check if field is checkbox
            is_checkbox = self._is_checkbox_field(pdf_field_name)
            
            # Format value
            if is_checkbox:
                value = self._format_checkbox_value(src_val, pdf_field_name, reader)
            else:
                value = self._format_regular_value(json_key, src_val, pdf_field_name, data, report)
            
            # Skip claims_made.retro_date if claims_made is not selected
            if json_key == "claims_made.retro_date":
                if not self.navigator.deep_get(data, "coverage_type.claims_made"):
                    report["skipped"].append((json_key, "claims_made_not_selected"))
                    continue
            
            # Warn if field not present in template
            if existing_field_names and pdf_field_name not in existing_field_names:
                report["unknown_pdf_fields"].append(pdf_field_name)
            
            # Write field
            if self.writer.write_field(writer, pdf_field_name, value):
                report["written"] += 1
            else:
                report["skipped"].append((json_key, "failed_to_update"))
        
        # Set NeedAppearances flag
        self.writer.set_need_appearances(writer)
        
        # Flatten PDF
        if not self.writer.flatten_pdf(writer):
            report["notes"].append("Flattening failed; fields may not be visible without viewer interaction.")
        
        # Save output
        try:
            with open(output_path, "wb") as f:
                writer.write(f)
        except Exception as e:
            print(f"Error writing output PDF {output_path}: {e}")
            report["notes"].append(f"Failed to write PDF: {e}")
            return report
        
        # Deduplicate unknown fields
        report["unknown_pdf_fields"] = sorted(set(report["unknown_pdf_fields"]))
        
        return report
    
    def _is_checkbox_field(self, pdf_field_name: str) -> bool:
        """
        Check if PDF field is a checkbox.
        
        Args:
            pdf_field_name: PDF field name
            
        Returns:
            True if checkbox, False otherwise
        """
        return (
            pdf_field_name.endswith("_Indicator_A") or
            pdf_field_name.endswith("_Indicator_B") or
            "Indicator" in pdf_field_name
        )
    
    def _format_checkbox_value(
        self,
        src_val: Any,
        pdf_field_name: str,
        reader: PdfReader
    ) -> str:
        """
        Format boolean value for checkbox field.
        
        Args:
            src_val: Source value from JSON
            pdf_field_name: PDF field name
            reader: PdfReader for getting checkbox state
            
        Returns:
            Checkbox state value
        """
        truthy = {True, "true", "yes", "y", "on", "1", 1}
        val_norm = str(src_val).strip().lower()
        set_on = (src_val in truthy) or (val_norm in {"true", "yes", "y", "on", "1"})
        
        if set_on:
            return self.writer.get_checkbox_on_value(pdf_field_name, reader)
        else:
            return "Off"
    
    def _format_regular_value(
        self,
        json_key: str,
        src_val: Any,
        pdf_field_name: str,
        data: Dict[str, Any],
        report: Dict[str, Any]
    ) -> str:
        """
        Format regular (non-checkbox) field value.
        
        Handles special cases:
        - Remarks field concatenation
        - Date/money formatting
        
        Args:
            json_key: JSON key
            src_val: Source value
            pdf_field_name: PDF field name
            data: Full data dictionary
            report: Report dictionary (for notes)
            
        Returns:
            Formatted value string
        """
        # Handle remarks concatenation
        if json_key in ["operations.hazards_description", "operations.subcontractors_used"]:
            if pdf_field_name == "GeneralLiabilityLineOfBusiness_RemarkText_A":
                haz = self.navigator.deep_get(data, "operations.hazards_description") or ""
                subs = self.navigator.deep_get(data, "operations.subcontractors_used") or ""
                value = f"{haz}; {subs}".strip("; ")
                if haz and subs:
                    report["notes"].append(f"Combined {json_key} into {pdf_field_name}")
                return value
        
        elif json_key == "operations.products_sold" and pdf_field_name == "GeneralLiabilityLineOfBusiness_RemarkText_B":
            return self.navigator.deep_get(data, json_key) or ""
        
        # Apply format hints
        hint = self.FORMAT_HINTS.get(json_key)
        return self.formatter.format_value(src_val, hint)