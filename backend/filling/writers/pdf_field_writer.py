"""
PDF field writer implementation.

Low-level PDF manipulation using pypdf.
Handles writing values to form fields and PDF structure setup.
"""

from typing import Any
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, DictionaryObject, BooleanObject
from ..interfaces.writer import IPdfWriter


class PdfFieldWriter(IPdfWriter):
    """
    Low-level PDF field writing operations.
    
    Handles:
    - Writing values to PDF form fields
    - Setting up AcroForm structure
    - PDF flattening
    - Viewer compatibility flags
    """
    
    def write_field(self, writer: PdfWriter, field_name: str, value: Any) -> bool:
        """
        Write value to PDF field across all pages.
        
        Args:
            writer: PdfWriter instance
            field_name: PDF field name
            value: Value to write
            
        Returns:
            True if write was successful, False otherwise
        """
        updated = False
        
        # Write to all pages (some widgets are per-page)
        for page in writer.pages:
            try:
                writer.update_page_form_field_values(page, {field_name: value})
                updated = True
            except Exception as e:
                print(f"Error updating field {field_name}: {e}")
                break
        
        return updated
    
    def setup_acro_form(self, reader: PdfReader, writer: PdfWriter) -> None:
        """
        Set up AcroForm in writer from reader.
        
        Copies form structure and ensures fields are accessible.
        
        Args:
            reader: Source PdfReader
            writer: Target PdfWriter
        """
        try:
            if "/AcroForm" in reader.trailer["/Root"]:
                acro_form = reader.trailer["/Root"]["/AcroForm"]
                writer._root_object[NameObject("/AcroForm")] = acro_form.clone(writer)
                
                # Ensure fields are accessible
                if "/Fields" not in writer._root_object["/AcroForm"]:
                    writer._root_object["/AcroForm"][NameObject("/Fields")] = acro_form.get("/Fields", [])
        except Exception as e:
            print(f"Error setting up /AcroForm: {e}")
            raise
    
    def set_need_appearances(self, writer: PdfWriter) -> None:
        """
        Set NeedAppearances flag for PDF viewer compatibility.
        
        Asks viewer to regenerate field appearances.
        Helps when not explicitly flattened.
        
        Args:
            writer: PdfWriter instance
        """
        try:
            catalog = writer._root_object
            if "/AcroForm" not in catalog:
                catalog[NameObject("/AcroForm")] = DictionaryObject()
            catalog["/AcroForm"].update({
                NameObject("/NeedAppearances"): BooleanObject(True)
            })
        except Exception as e:
            print(f"Warning: Failed to set NeedAppearances: {e}")
    
    def flatten_pdf(self, writer: PdfWriter) -> bool:
        """
        Flatten PDF form fields.
        
        Makes fields non-editable and ensures consistent rendering.
        
        Args:
            writer: PdfWriter instance
            
        Returns:
            True if flattening succeeded, False otherwise
        """
        try:
            writer._flatten()
            return True
        except AttributeError:
            print("Warning: Flattening not supported. Output may require viewer regeneration.")
            return False
    
    def get_checkbox_on_value(self, field_name: str, reader: PdfReader) -> str:
        """
        Get the "on" value for a checkbox field.
        
        Different PDFs use different values for checked state:
        - "/Yes", "/On", "/1", etc.
        
        This method inspects the PDF to find the correct value.
        
        Args:
            field_name: PDF checkbox field name
            reader: PdfReader instance
            
        Returns:
            Checkbox "on" value (e.g., "/Yes")
        """
        fields = reader.get_fields()
        
        if fields and field_name in fields:
            ap = fields[field_name].get('/AP')
            if ap and '/N' in ap:
                # Use the first appearance state
                return list(ap['/N'].keys())[0]
        
        # Fallback to common default
        return '/Yes'