"""
Excel/CSV reader implementation with enhanced extraction.

Auto-registers for Excel and CSV MIME types.
"""

import pandas as pd
import openpyxl
from .base_reader import BaseReader
from ..document import Document, TableData
from ..file_loader import reader_registry


@reader_registry.register(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  # xlsx
    'application/vnd.ms-excel',  # xls
    'text/csv'
)
class ExcelReader(BaseReader):
    """
    Enhanced Excel and CSV file reader.
    
    Extracts tables, formulas, and metadata from spreadsheets.
    Auto-registered for Excel and CSV MIME types.
    """
    
    def read(self, file_path: str, document: Document) -> None:
        """
        Read Excel/CSV file and populate document.
        
        Args:
            file_path: Path to file
            document: Document object to populate
        """
        try:
            # Determine file type
            if file_path.endswith('.csv'):
                self._read_csv(file_path, document)
            else:
                self._read_excel(file_path, document)
            
        except Exception as e:
            document.add_error(f"Failed to read Excel/CSV: {str(e)}")
            raise
    
    def _read_csv(self, file_path: str, document: Document):
        """Read CSV file."""
        df = pd.read_csv(file_path)
        
        # Convert to TableData
        headers = df.columns.tolist()
        rows = df.values.tolist()
        
        table = TableData(
            headers=headers,
            rows=rows,
            metadata={
                'sheet_name': 'CSV',
                'row_count': len(df),
                'column_count': len(df.columns)
            }
        )
        
        document.add_table(table)
        
        # Add as text for classification
        self._add_table_as_text(document, 'CSV', headers, rows)
        
        # Store metadata
        document.metadata['sheet_count'] = 1
        document.metadata['total_rows'] = len(df)
        document.metadata['total_columns'] = len(df.columns)
        document.structure.page_count = 1
    
    def _read_excel(self, file_path: str, document: Document):
        """Read Excel file with enhanced metadata."""
        # Read all sheets
        df_dict = pd.read_excel(file_path, sheet_name=None)
        
        # Extract workbook metadata using openpyxl
        try:
            wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
            props = wb.properties
            
            document.metadata['title'] = props.title or ''
            document.metadata['author'] = props.creator or ''
            document.metadata['subject'] = props.subject or ''
            document.metadata['keywords'] = props.keywords or ''
            document.metadata['created'] = props.created.isoformat() if props.created else ''
            document.metadata['modified'] = props.modified.isoformat() if props.modified else ''
            
        except Exception as e:
            document.add_warning(f"Failed to extract Excel metadata: {e}")
        
        # Store sheet count
        document.metadata['sheet_count'] = len(df_dict)
        document.metadata['sheet_names'] = list(df_dict.keys())
        document.structure.page_count = len(df_dict)
        
        # Extract tables from each sheet
        total_rows = 0
        total_columns = 0
        
        for sheet_name, df in df_dict.items():
            if df.empty:
                continue
            
            # Convert DataFrame to TableData
            headers = df.columns.tolist()
            rows = df.values.tolist()
            
            table = TableData(
                headers=headers,
                rows=rows,
                metadata={
                    'sheet_name': sheet_name,
                    'row_count': len(df),
                    'column_count': len(df.columns)
                }
            )
            
            document.add_table(table)
            
            # Add as text for classification
            self._add_table_as_text(document, sheet_name, headers, rows)
            
            total_rows += len(df)
            total_columns += len(df.columns)
        
        document.metadata['total_rows'] = total_rows
        document.metadata['total_columns'] = total_columns
    
    def _add_table_as_text(self, document: Document, sheet_name: str, headers: list, rows: list):
        """Convert table to text representation for classification."""
        text_lines = [f"\n\n=== {sheet_name} ==="]
        
        # Add headers
        text_lines.append(' | '.join(str(v) for v in headers))
        text_lines.append('-' * 80)
        
        # Add first 20 rows for classification
        for row in rows[:20]:
            text_lines.append(' | '.join(str(v) for v in row))
        
        if len(rows) > 20:
            text_lines.append(f"... and {len(rows) - 20} more rows")
        
        document.raw_text += '\n'.join(text_lines)