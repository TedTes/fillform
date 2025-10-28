"""
Excel/CSV reader implementation.

Auto-registers for Excel and CSV MIME types.
"""

import pandas as pd
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
    Excel and CSV file reader.
    
    Extracts tables from spreadsheets.
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
                df_dict = {'Sheet1': pd.read_csv(file_path)}
            else:
                df_dict = pd.read_excel(file_path, sheet_name=None)
            
            # Store sheet count
            document.metadata['sheet_count'] = len(df_dict)
            document.structure.page_count = len(df_dict)
            
            # Extract tables from each sheet
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
                
                # Also add as raw text for classification
                text_lines = [' | '.join(str(v) for v in headers)]
                for row in rows[:10]:  # First 10 rows for classification
                    text_lines.append(' | '.join(str(v) for v in row))
                
                document.raw_text += f"\n\n=== {sheet_name} ===\n" + '\n'.join(text_lines)
            
            document.metadata['total_rows'] = sum(len(df) for df in df_dict.values())
            document.metadata['total_columns'] = sum(len(df.columns) for df in df_dict.values())
            
        except Exception as e:
            document.add_error(f"Failed to read Excel/CSV: {str(e)}")
            raise