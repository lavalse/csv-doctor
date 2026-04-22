# CSV Doctor

<p align="center">
  <img src="public/csv_doctor.png" alt="CSV Doctor" width="160" />
</p>

**English · [日本語](./README.ja.md)**

A browser-based CSV cleaning and WebGIS conversion tool. Load Shift_JIS / CP932 / UTF-8 CSV files, apply automatic cleaning, and download a clean UTF-8 CSV with no character corruption. If coordinate columns are present, it also converts to **GeoJSON / CZML / KML**.

**All processing happens in your browser. Files are never uploaded to a server.**

🚀 **Online demo**: https://csv-doctor.surreal.tools (coming soon)

---

## Features

### CSV Cleaning
| Feature | Description |
|---------|-------------|
| Auto-detect encoding | Shift_JIS / CP932 / UTF-8 (with/without BOM) |
| Auto-detect delimiter | Comma / semicolon / tab |
| Unicode normalization (NFKC) | Converts full-width characters to half-width |
| Invisible character removal | Strips zero-width spaces and other control characters |
| Trim header/cell whitespace | Removes leading and trailing whitespace |
| Multiline cell normalization | Unifies line breaks inside cells |
| Empty row removal | Deletes rows with no data |
| Duplicate/empty header handling | Appends suffixes to duplicates, auto-names empty headers |

### File Limits
| Item | Limit |
|------|-------|
| File size | 50 MB (error above, warning above 5 MB) |
| Row count | 100,000 rows |

### Coordinate Column Auto-Detection
- Automatically identifies longitude/latitude columns from CSV headers and pre-fills the export panel dropdowns
- Supports English (`longitude`, `lat`, `lng`, etc.), Chinese (`经度`, `纬度`), and Japanese (`経度`, `緯度`)
- Falls back to manual selection if detection fails

### GeoJSON Export
- Select longitude/latitude (required) and height (optional) columns from the UI
- Outputs selected coordinates as `Point` geometry
- Rows with invalid coordinates are output as `geometry: null` (rows are not dropped)
- Non-coordinate columns are automatically stored in `properties` (numeric strings are converted to `number`)
- Marker color and size specified via UI are output as `marker-color` / `marker-size` properties
- Output format: `GeoJSON FeatureCollection` (`application/geo+json`)

### CZML Export
- Specify longitude/latitude/height columns, name column, point color, and size
- Height defaults to 0 m if unspecified
- Directly usable in Cesium / Re:Earth and other CZML viewers
- Output format: `CZML` (`application/json`)

### KML Export
- Specify longitude/latitude/height columns, name column, description column, icon color, and scale
- Icon color `#RRGGBB` is automatically converted to KML's `AABBGGRR` format
- Directly usable in Google Earth / QGIS and other KML-compatible apps
- Output format: `KML` (`application/vnd.google-earth.kml+xml`)

---

## Tech Stack

| Item | Details |
|------|---------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| CSV parser | PapaParse |
| Encoding conversion | encoding-japanese |
| Styling | Plain CSS (no framework) |

---

## Project Structure

```
src/
├── App.tsx                     # Root component & processing pipeline
├── types/
│   └── csv.ts                  # Type definitions (ProcessingResult, GeoJSONExportOptions, etc.)
├── lib/
│   ├── detectEncoding.ts       # Encoding detection
│   ├── decodeFile.ts           # ArrayBuffer → string decoding
│   ├── normalizeText.ts        # Text-level normalization
│   ├── detectDelimiter.ts      # Delimiter detection
│   ├── parseCsv.ts             # CSV parsing (PapaParse wrapper)
│   ├── normalizeHeaders.ts     # Header normalization & dedup
│   ├── normalizeCells.ts       # Cell normalization
│   ├── filterEmptyRows.ts      # Empty row filter
│   ├── validateRows.ts         # Validation & warning generation
│   ├── regenerateCsv.ts        # Clean CSV regeneration
│   ├── generateGeojson.ts      # GeoJSON conversion
│   ├── generateCzml.ts         # CZML conversion
│   └── generateKml.ts          # KML conversion
└── components/
    ├── FileDropzone.tsx        # File drop/select UI
    ├── FileSummary.tsx         # File info summary
    ├── OptionsPanel.tsx        # Cleaning options UI
    ├── CleaningReport.tsx      # Processing results & warnings
    ├── PreviewTable.tsx        # Data preview table
    ├── DownloadButton.tsx      # CSV download button
    ├── GeoJSONPanel.tsx        # GeoJSON export UI
    ├── CZMLPanel.tsx           # CZML export UI
    ├── KMLPanel.tsx            # KML export UI
    └── ErrorNotice.tsx         # Error display
```

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview the build
npm run preview
```

---

## Processing Pipeline

```
File (Shift_JIS / UTF-8)
  └─ detectEncoding       → Encoding detection
  └─ decodeFile           → Decode to UTF-16 string
  └─ normalizeText        → Strip BOM / unify newlines / NFKC / remove invisible chars
  └─ detectDelimiter      → Delimiter detection
  └─ parseCsv             → rows: string[][]
  └─ normalizeHeaders     → Dedup / fill empty headers
  └─ normalizeCells       → Trim / multiline normalization
  └─ filterEmptyRows      → Remove empty rows
  └─ validateRows         → Generate warning list
  └─ regenerateCsv        → Clean UTF-8 CSV text
                          → (optional) generateGeojson → GeoJSON FeatureCollection
                          → (optional) generateCzml    → CZML
                          → (optional) generateKml     → KML
```

---

## Built With Claude

This project was built with [Claude Code](https://claude.com/claude-code), Anthropic's AI coding assistant, as a pair-programming collaborator across design, implementation, and documentation.

---

## License

[MIT License](./LICENSE) © 2026 lavalse
