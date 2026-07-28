# Agent Contract: Data Sourcing & Importer Engine

## Objective
Build Python modules to parse MegaMek MTF/BLK chassis data files into standardized JSON payloads, and fetch supplemental lore/description metadata from Sarna.net via their public MediaWiki API.

## Output Specifications
1. \packages/data_importer/mtf_parser.py\:
   - Accepts raw text from an MTF file.
   - Extracts key fields: Chassis Name, Variant, Tonnage, Tech Level, ERA, Engine Type/Rating, Heat Sinks, Armor Values (per location), and Equipment/Weapon Layout.
   - Converts armor, structure, and weapons into structured JSON objects.

2. \packages/data_importer/sarna_client.py\:
   - Async HTTP client utilizing \httpx\ or \equests\.
   - Fetches article summaries or page URLs for a given chassis name (e.g., "Timber Wolf" or "Warhammer") via \https://www.sarna.net/wiki/api.php\.

3. \packages/data_importer/tests/test_mtf_parser.py\:
   - Unit tests parsing sample MTF files (e.g., standard Mech configurations) to ensure output payload integrity.

## Definition of Done
- MTF parser accurately parses sample Mech configurations into clean JSON/dict models.
- Sarna client successfully returns Wiki URLs or summary snippets without error.
- All unit tests pass cleanly.
