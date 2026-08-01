# 🛡️ BattleTech Campaign Manager (`BT-Manager`)

**Publisher:** Lüdinn Entertainment  
**Version:** `0.1.0-alpha`  
**Repository:** [https://github.com/jdickinson9691/BT-Manager.git](https://github.com/jdickinson9691/BT-Manager.git)  
**Target Platform:** Desktop (Windows 10/11 x64) / Electron Shell / Web PWA  

---

## 📖 Executive Summary

**BT-Manager** is a comprehensive, standalone tabletop companion application designed for Game Masters and mercenary commanders playing *BattleTech* tabletop campaigns. It automates Chaos Campaign Warchest economics, Master Unit List (MUL) procurement, OpFor battle value parity auditing, pilot skill progressions (*A Time of War v4.0*), Tech Bay repair duration clocks (*Strategic Operations v5.0*), and Flechs Sheets digital record tracking.

---

## 🔥 Key Features & Capabilities

### 🎲 1. In-Person Tabletop Game Master Workflow
- **7 Historical BattleTech Eras**: Full support for `2750` (Star League), `2821` (Early Succession Wars), `3025` (Late Succession Wars), `3050` (Clan Invasion), `3062` (Civil War), `3068` (Jihad), and `3151` (ilClan).
- **Era-Filtered Factions**: Faction choices dynamically update based on historical presence (e.g. Clan Wolf, Clan Jade Falcon, Word of Blake, House Davion).
- **🎲 Random Force Generator**: Generates era-accurate, faction-appropriate Mechs, vehicles, and MechWarriors from the Master Unit List database with real-time validation checks.
- **Contract BV2 Threat Parity Audit**: Computes player force Battle Value (BV2) vs contract OpFor threat rating, badging contracts as 🟢 **Balanced**, 🟡 **Challenging**, or 🔴 **Extreme Threat**.

### 🏢 2. Mercenary Company Asset Dashboard (`View Company`)
- **Interactive Asset Roster**: Overview of all active BattleMechs, Combat Vehicles, Personnel & MechWarriors, and Salvaged Warehouse Components.
- **Cross-Section Navigation**: Direct quick-links to Step 4 (Tech Bay & MechLab) and Step 5 (Personnel & MedBay).

### 🌐 3. Data Integration Network (MUL, Sarna, MegaMek & Flechs)
- **📊 Flechs Sheets Data Agent**: Controlled via top header toggle `📊 Flechs: Online / Cached` (`POST /api/v1/network/config`) for background unit specs & MTF catalog data caching. Zero UI display or print clutter.
- **📄 MegaMek `.MTF` Export**: One-click MTF unit file exporter (`GET /api/v1/units/{unit_id}/export-mtf`) compatible with MegaMekLab and Flechs Sheets.
- **🌐 Network Toggles**: Four independent data source toggles (`MUL`, `Sarna`, `MegaMek`, `Flechs`) switching seamlessly between live background data sync and local offline SQLite caching.

---

## 🏛️ Architecture & Stack

- **Desktop Shell**: Electron 43.2.0 hosting static Next.js export and launching bundled PyInstaller backend (`dist/main/main.exe`).
- **Frontend**: Next.js 14 + React 18 single-page dashboard with dark-mode cyberpunk glassmorphism layout.
- **Backend API**: Python 3.14 + FastAPI REST API exposing 22+ endpoints.
- **Database**: SQLAlchemy + SQLite (`bt_manager.db`) tracking campaigns, units, pilots, inventory, and logs.
- **Unit Cache**: Master Unit List (MUL) local SQLite database with Sarna.net wiki scraping fallback and Flechs data agent.

---

## 🧪 Verification & Testing (23/23 Tests Passing)

To run the automated test suite:

```bash
python tests/test_harness.py
```

All **23 unit tests** pass clean in `<1.0s`.

---

## 📦 Installer & Binaries

- **Installer**: `dist/BT-Manager Setup 0.1.0-alpha.exe`
- **Backend Binary**: `dist/main/main.exe`
- **Web Export**: `apps/web/out/index.html`

---

## 📜 Intellectual Property & Legal Disclaimer

*BattleTech, MechWarrior, and associated logos, faction emblems, and unit names are registered trademarks of Topps Company, Inc. and Catalyst Game Labs. BT-Manager is an open-source, non-commercial tabletop companion tool created by Lüdinn Entertainment for fan utility and campaign management.*
