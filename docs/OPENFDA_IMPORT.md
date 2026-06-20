# OpenFDA Bulk Data Import

This document explains how to use the OpenFDA bulk data import script to populate the Remedi database with real pharmaceutical data from the FDA.

## Overview

The import script fetches pharmaceutical drug and supplement data from the [OpenFDA API](https://open.fda.gov/) and imports it into the `Pharmaceutical` model in the database.

**Script Location**: [scripts/import-openfda-data.ts](../scripts/import-openfda-data.ts)

## Features

- ✅ Fetches data from multiple FDA datasets (drugs, supplements)
- ✅ Automatic category classification based on drug indications
- ✅ Rate limiting to comply with FDA API limits (240 req/min)
- ✅ Duplicate detection (skips existing drugs)
- ✅ Dry run mode for testing
- ✅ Category filtering
- ✅ Comprehensive error handling
- ✅ Progress reporting

## Quick Start

### 1. Basic Import (100 drugs)

```bash
npm run import:fda
```

### 2. Dry Run (Preview without importing)

```bash
npm run import:fda:dry
```

### 3. Quick Import (50 drugs)

```bash
npm run import:fda:quick
```

## Advanced Usage

### Command Line Options

```bash
npm run import:fda -- [options]
```

**Available Options**:

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--limit <number>` | Maximum number of drugs to import | 100 | `--limit 500` |
| `--skip <number>` | Number of records to skip | 0 | `--skip 100` |
| `--dataset <name>` | Dataset to import from | both | `--dataset drugs` |
| `--category <name>` | Filter by category | all | `--category "Pain Relief"` |
| `--dry-run` | Preview data without importing | false | `--dry-run` |

### Examples

**Import 500 drugs**:
```bash
npm run import:fda -- --limit 500
```

**Import only pain relief medications**:
```bash
npm run import:fda -- --category "Pain Relief" --limit 100
```

**Import starting from record 200**:
```bash
npm run import:fda -- --skip 200 --limit 100
```

**Import only supplements**:
```bash
npm run import:fda -- --dataset supplements --limit 50
```

**Preview cardiovascular medications**:
```bash
npm run import:fda -- --category "Cardiovascular" --dry-run
```

**Large batch import**:
```bash
npm run import:fda -- --limit 1000 --dataset drugs
```

## Categories

The script automatically classifies drugs into the following categories:

| Category | Keywords |
|----------|----------|
| **Pain Relief** | pain, analgesic, aspirin, ibuprofen, acetaminophen |
| **Cardiovascular** | heart, blood pressure, hypertension, cholesterol |
| **Diabetes** | diabetes, insulin, blood sugar, glucose |
| **Respiratory** | asthma, breathing, respiratory, inhaler |
| **Mental Health** | depression, anxiety, mood, psychiatric |
| **Digestive** | stomach, digestive, acid reflux, ulcer |
| **Infection** | antibiotic, infection, bacterial, viral |
| **Allergy** | allergy, allergic, antihistamine |
| **Inflammation** | inflammation, inflammatory, arthritis |
| **Supplement** | vitamin, mineral, supplement, nutrient |
| **General** | (default for uncategorized) |

## Data Structure

Each imported pharmaceutical includes:

```typescript
{
  fdaId: string;           // FDA application/NDC number
  name: string;            // Brand or generic name
  description: string;     // Drug description
  category: string;        // Auto-classified category
  ingredients: string[];   // Active ingredients
  benefits: string[];      // Indications and uses
  usage: string;           // Dosage and administration
  warnings: string;        // Warnings and precautions
  interactions: string;    // Drug interactions
}
```

## FDA API Datasets

### 1. Drug Labels (`/drug/label.json`)

Contains comprehensive information about FDA-approved drugs:
- Brand and generic names
- Active ingredients
- Indications and usage
- Dosage and administration
- Warnings and precautions
- Drug interactions

### 2. Supplements (`/food/ndc.json`)

Contains information about dietary supplements:
- Product names
- Ingredients
- National Drug Code (NDC)

## Rate Limiting

The FDA API has the following rate limits:
- **With API Key**: 240 requests per minute
- **Without API Key**: 40 requests per minute

The script implements:
- 1-second delay between requests (60 req/min)
- Automatic retry on rate limit errors
- Progress reporting

**To increase rate limit**:
1. Get an API key from [FDA Open API](https://open.fda.gov/apis/authentication/)
2. Add to `.env.local`:
   ```
   OPENFDA_API_KEY=your-api-key-here
   ```
3. Update script to include API key in requests

## Error Handling

The script handles various error scenarios:

### Network Errors
```
❌ Error fetching from FDA: Network error
```
**Solution**: Check internet connection, retry

### API Errors
```
❌ FDA API error: 404 Not Found
```
**Solution**: Adjust search query or skip parameter

### Duplicate Drugs
```
⏭️  Skipping existing: Aspirin
```
**Solution**: Normal behavior, drug already in database

### Invalid Data
```
⚠️  Skipping drug with no name
```
**Solution**: Normal behavior, incomplete FDA record

## Output

The script provides detailed progress information:

```
🚀 Starting OpenFDA Data Import
================================

Configuration:
  - Dataset: both
  - Limit: 100
  - Skip: 0
  - Category: all
  - Dry Run: false

📦 Processing dataset: drugs
──────────────────────────────────────────────────
📡 Fetching: https://api.fda.gov/drug/label.json?limit=100&skip=0
✅ Found 100 records
✅ Imported: Aspirin
✅ Imported: Ibuprofen
⏭️  Skipping existing: Acetaminophen
...

📊 Import Summary
================================
✅ Successfully imported: 97
⏭️  Skipped (duplicates): 2
❌ Errors: 1
📦 Total processed: 100
```

## Database Schema

Imported data is stored in the `Pharmaceutical` model:

```prisma
model Pharmaceutical {
  id          String   @id @default(uuid())
  fdaId       String?  // FDA application/NDC number
  name        String   @unique
  description String?
  category    String
  ingredients String   // JSON array
  benefits    String   // JSON array
  usage       String?
  warnings    String?
  interactions String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  remedies    NaturalRemedyMapping[]

  @@index([name])
  @@index([category])
  @@index([fdaId])
}
```

## Best Practices

### 1. Start with Dry Run

Always preview data before importing:
```bash
npm run import:fda:dry
```

### 2. Import in Batches

For large imports, use batches to avoid timeouts:
```bash
# Batch 1
npm run import:fda -- --limit 100 --skip 0

# Batch 2
npm run import:fda -- --limit 100 --skip 100

# Batch 3
npm run import:fda -- --limit 100 --skip 200
```

### 3. Filter by Category

Import specific categories first to get relevant data:
```bash
npm run import:fda -- --category "Pain Relief"
npm run import:fda -- --category "Cardiovascular"
```

### 4. Monitor Progress

Watch for errors and adjust limits accordingly:
- High error rate → reduce limit, check internet
- Many duplicates → increase skip parameter
- Slow imports → reduce limit to avoid timeouts

### 5. Verify Imports

Check the database after import:
```bash
# Using Prisma Studio
npx prisma studio

# Or query directly
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Pharmaceutical;"
```

## Troubleshooting

### Issue: Script timeout

**Cause**: Too many requests or slow network

**Solution**:
```bash
# Reduce batch size
npm run import:fda -- --limit 50
```

### Issue: Rate limit exceeded

**Cause**: Too many requests too quickly

**Solution**:
- Wait a minute and retry
- Script automatically delays between requests
- Consider getting an FDA API key

### Issue: No results found

**Cause**: Invalid category or search query

**Solution**:
```bash
# Check available categories in script
# Try broader category
npm run import:fda -- --category "General"
```

### Issue: Duplicate key errors

**Cause**: Drug already exists in database

**Solution**:
- This is expected behavior
- Script automatically skips duplicates
- Use `--skip` to start from a different offset

### Issue: TypeScript errors

**Cause**: Missing dependencies or type definitions

**Solution**:
```bash
npm install
npm run type-check
```

## Performance

Import performance depends on:
- FDA API response time (~500ms per request)
- Rate limiting delay (1 second)
- Database write speed (~10ms per record)

**Estimated times**:
- 50 drugs: ~1 minute
- 100 drugs: ~2 minutes
- 500 drugs: ~10 minutes
- 1000 drugs: ~20 minutes

## Maintenance

### Update Script

The script may need updates for:
- New FDA API endpoints
- Changes to data structure
- Additional categories
- Enhanced error handling

### Database Cleanup

Remove imported data if needed:
```bash
# Using Prisma Studio
npx prisma studio
# Navigate to Pharmaceutical model and delete records

# Or using SQL
sqlite3 prisma/dev.db "DELETE FROM Pharmaceutical WHERE fdaId IS NOT NULL;"
```

### Verify Data Quality

Periodically check data quality:
```bash
# Check for drugs without categories
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Pharmaceutical WHERE category = 'General';"

# Check for drugs without FDA IDs
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Pharmaceutical WHERE fdaId IS NULL;"
```

## Future Enhancements

Potential improvements:
1. **Parallel imports**: Import multiple datasets simultaneously
2. **Incremental updates**: Only fetch new/updated drugs
3. **Enhanced classification**: Use AI for better categorization
4. **Data validation**: Verify data quality before import
5. **Progress persistence**: Resume interrupted imports
6. **Scheduled imports**: Automatic daily/weekly updates

## Resources

- [OpenFDA API Documentation](https://open.fda.gov/apis/)
- [Drug Label Endpoint](https://open.fda.gov/apis/drug/label/)
- [NDC Endpoint](https://open.fda.gov/apis/drug/ndc/)
- [FDA Data Dictionary](https://open.fda.gov/apis/drug/label/searchable-fields/)
- [Rate Limiting](https://open.fda.gov/apis/authentication/)

## Support

For issues or questions:
1. Check [OpenFDA API Status](https://open.fda.gov/apis/status/)
2. Review script logs for specific errors
3. Test with `--dry-run` first
4. Start with small batches (`--limit 10`)
