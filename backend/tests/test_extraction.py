from extraction.extractors import Acord126Extractor
import json
# Create extractor
extractor = Acord126Extractor()

# Extract from PDF
result = extractor.extract("tests/fixtures/ACORD_126_filled.pdf")

# Check result
if result.is_successful():
  with open("tests/extracted_data.json", "w") as f:
    json.dump(result.json, f, indent=2)
    
else:
    print(f"Error: {result.error}")