# Global AI Data Center Construction Tracker

An interactive map tracking **$700B+** in AI data center construction projects worldwide. Explore facilities being built by OpenAI, Meta, Google, Microsoft, Amazon, xAI, Anthropic, and more.

[**Live Demo**](#) &nbsp;&middot;&nbsp; [**Data Sources**](#data)

---

## Overview

The AI infrastructure buildout is the largest single-purpose construction effort in modern history. This project visualizes **30+ major projects** across four continents, with markers sized by power capacity and colored by company.

| Metric | Value |
|---|---|
| **Projects Tracked** | 30+ |
| **Total Investment** | $700B+ |
| **Power Capacity** | Dozens of GW |
| **Companies** | 15+ |
| **Regions** | USA, Europe, Middle East, Asia-Pacific |

---

## Features

- **Interactive Map** &mdash; Leaflet.js-powered map with CARTO basemaps (dark & light)
- **Company Filtering** &mdash; Filter markers by company group (OpenAI/Stargate, Meta, Google, Microsoft, Amazon, xAI, and more)
- **Status Filtering** &mdash; View projects by stage: Operational, Under Construction, Under Development, Expanding
- **Detail Panel** &mdash; Click any marker for investment amounts, power capacity, GPU counts, job numbers, and source links
- **Animated Markers** &mdash; Pulsing circles scaled proportionally to facility power capacity (MW/GW)
- **Dark / Light Theme** &mdash; Toggle between themes with automatic map tile switching
- **Responsive Design** &mdash; Full desktop layout with slide-out panel; mobile-optimized with bottom sheet
- **Animated Statistics** &mdash; Header displays live-filtered totals with eased counting animations
- **Accessible** &mdash; Skip-to-content link, ARIA labels, keyboard navigation, `prefers-reduced-motion` support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Map | [Leaflet.js](https://leafletjs.com/) 1.9.4 |
| Tiles | [CARTO](https://carto.com/) dark/light basemaps |
| Fonts | [Inter](https://rsms.me/inter/) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/) via Google Fonts |
| Styling | Vanilla CSS with custom properties (design tokens), fluid typography (`clamp`), and CSS logical properties |
| Data | Static JSON (`data.json`) |
| Build | None &mdash; zero dependencies, no bundler required |

---

## Project Structure

```
ai-data-centers-map/
├── index.html      # Single-page app shell
├── app.js          # Map logic, filtering, panels, theming
├── data.json       # 30+ data center entries with coordinates and metadata
├── base.css        # CSS reset and global defaults
├── style.css       # Design tokens (colors, typography, spacing) + theme definitions
├── map.css         # Layout, components, Leaflet overrides, responsive breakpoints
└── README.md
```

---

## Getting Started

No build step required. Serve the files with any static file server:

```bash
# Python
python3 -m http.server 8000

# Node.js (npx)
npx serve .

# VS Code
# Install "Live Server" extension, then right-click index.html → Open with Live Server
```

Open `http://localhost:8000` in your browser.

---

## Data Format

<a id="data"></a>

Each entry in `data.json` follows this schema:

```json
{
  "name": "Stargate — Abilene Flagship",
  "company": "OpenAI / Oracle / SoftBank",
  "location": "Abilene, Texas, USA",
  "lat": 32.4487,
  "lng": -99.7331,
  "investment": "$3.5B (Phase 1)",
  "power": "1.2 GW",
  "status": "Partially Operational — 2 of 8 buildings live since Sep 2025",
  "details": "Flagship campus of the $500B Stargate initiative...",
  "category": "Training Mega-Campus",
  "gpus": "450,000+ GB200",
  "jobs": "~300 permanent, 6,400 construction",
  "source": "https://example.com/article"
}
```

| Field | Description |
|---|---|
| `name` | Project or campus name |
| `company` | Operator(s) / investor(s) |
| `location` | Human-readable location |
| `lat` / `lng` | Coordinates for map placement |
| `investment` | Disclosed or estimated capital expenditure |
| `power` | Electrical capacity in MW or GW |
| `status` | Current construction/operational status |
| `details` | Extended description |
| `category` | Facility type (Training Mega-Campus, AI/Cloud Hybrid, Inference Factory, etc.) |
| `gpus` | GPU/chip deployment info |
| `jobs` | Employment figures (permanent + construction) |
| `source` | URL to primary source article |

---

## Companies Tracked

| Company Group | Color | Example Projects |
|---|---|---|
| OpenAI / Stargate | ![#FF6B2B](https://placehold.co/12x12/FF6B2B/FF6B2B) `#FF6B2B` | Abilene, Lordstown, Milam County |
| Meta | ![#0668E1](https://placehold.co/12x12/0668E1/0668E1) `#0668E1` | Hyperion (Louisiana), Prometheus (Ohio) |
| Google | ![#34A853](https://placehold.co/12x12/34A853/34A853) `#34A853` | Texas Panhandle, West Memphis, Germany |
| Microsoft | ![#00BCF2](https://placehold.co/12x12/00BCF2/00BCF2) `#00BCF2` | Fairwater (Wisconsin + Atlanta) |
| Amazon / AWS | ![#FF9900](https://placehold.co/12x12/FF9900/FF9900) `#FF9900` | Project Rainier, Louisiana, Ohio |
| xAI | ![#FFFFFF](https://placehold.co/12x12/FFFFFF/FFFFFF) `#FFFFFF` | Colossus (Memphis), Atlanta |
| Anthropic | ![#D4A574](https://placehold.co/12x12/D4A574/D4A574) `#D4A574` | Texas & New York (Fluidstack) |
| CoreWeave / NVIDIA | ![#76B900](https://placehold.co/12x12/76B900/76B900) `#76B900` | Kenilworth NJ, Ellendale ND |
| Nscale | ![#2DD4BF](https://placehold.co/12x12/2DD4BF/2DD4BF) `#2DD4BF` | Narvik (Norway), Sines (Portugal), UK |
| Nebius | ![#8B5CF6](https://placehold.co/12x12/8B5CF6/8B5CF6) `#8B5CF6` | Independence, Missouri |
| G42 / UAE | ![#F59E0B](https://placehold.co/12x12/F59E0B/F59E0B) `#F59E0B` | Abu Dhabi 5 GW campus |
| Saudi Arabia | ![#EAB308](https://placehold.co/12x12/EAB308/EAB308) `#EAB308` | NEOM / DataVolt, Groq / Aramco |

---

## Browser Support

Tested on modern evergreen browsers. Requires JavaScript enabled.

- Chrome / Edge 90+
- Firefox 90+
- Safari 15+
- Mobile Safari / Chrome on iOS and Android

---

## Contributing

1. Fork this repository
2. Add or update entries in `data.json` (include a `source` URL)
3. Test locally with a static server
4. Submit a pull request

All data should be sourced from publicly available reporting. Include the source link for any new entry.

---

## License

MIT

---

<sub>Data compiled from public sources as of March 2026.</sub>
