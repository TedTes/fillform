# Extraction Strategies

## Fusion Strategy

Combines data from multiple documents into unified submission.

### Basic Usage
```python
from extraction import FusionStrategy, DocumentGroup
from extraction.core import UniversalFileLoader

# Load multiple documents
loader = UniversalFileLoader()
documents = [
    loader.load('acord_126.pdf'),
    loader.load('loss_run.pdf'),
    loader.load('sov.xlsx'),
    loader.load('photo1.jpg'),
    loader.load('photo2.jpg'),
]

# Create document group
group = DocumentGroup(
    group_id='submission_12345',
    documents=documents
)

# Fuse data
strategy = FusionStrategy()
result = strategy.fuse(group)

# Access unified data
print(result.data['application'])      # From ACORD
print(result.data['claims_history'])   # From Loss Run
print(result.data['property_schedule'])# From SOV
print(result.data['supplemental_documents'])  # Photos
```

### Advanced Configuration
```python
strategy = FusionStrategy(
    enable_cross_validation=True,
    conflict_resolution='highest_confidence',
    include_source_tracking=True
)

result = strategy.fuse(group)

# Check validation warnings
if result.warnings:
    for warning in result.warnings:
        print(f"Warning: {warning}")

# Track source of each field
if 'applicant' in result.data:
    name = result.data['applicant']['name']
    source = result.data['applicant']['name_source']
    print(f"{name} came from {source}")
```

### Conflict Resolution Methods

**highest_confidence** (default)
- Uses value with highest extraction confidence
- Best for automated processing

**most_recent** 
- Uses value from most recently uploaded document
- Good when documents have timestamps

**primary_source**
- Uses value from primary document type (e.g., ACORD over supplemental)
- Best for hierarchical data sources

### Real-World Example
```python
# Insurance submission with 10 files
files = [
    'application_acord126.pdf',      # Primary application
    'loss_history_5years.pdf',       # Claims
    'property_schedule.xlsx',        # Locations
    'financial_statement.pdf',       # Financials
    'driver_license_owner.jpg',      # ID verification
    'driver_license_driver1.jpg',    # Additional driver
    'driver_license_driver2.jpg',    # Additional driver
    'property_photo1.jpg',           # Property photos
    'property_photo2.jpg',
    'certificate_prior.pdf',         # Prior insurance cert
]

# Load and classify all
documents = [loader.load(f) for f in files]

# Group and fuse
group = DocumentGroup(group_id='sub_001', documents=documents)
result = FusionStrategy().fuse(group)

# Result structure:
{
    'submission_id': 'sub_001',
    'application': {
        'acord_126': { ... },  # Application data
    },
    'claims_history': {
        'claims': [ ... ],     # All claims merged
        'totals': { ... }
    },
    'property_schedule': {
        'properties': [ ... ], # All locations merged
        'totals': { ... }
    },
    'financial_information': { ... },
    'supplemental_documents': [
        {'file_name': 'driver_license_owner.jpg', 'type': 'driver_license', ...},
        {'file_name': 'property_photo1.jpg', 'type': 'photo', ...},
        ...
    ],
    'applicant': {
        'name': 'ABC Company',
        'name_source': 'application_acord126.pdf',
        ...
    },
    'fusion_metadata': {
        'total_documents': 10,
        'successful_extractions': 10,
        ...
    }
}
```

### Integration with Pipeline
```python
from extraction import ExtractionPipeline, FusionStrategy, DocumentGroup

# Process individual files through pipeline
pipeline = ExtractionPipeline()
documents = [pipeline.process(f).document for f in files]

# Fuse results
group = DocumentGroup(group_id='submission', documents=documents)
fused_result = FusionStrategy().fuse(group)
```