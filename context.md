# AuditIQ — Codebase Context

## What is AuditIQ?

**AuditIQ** is a full-stack web PoC (Proof of Concept) for **automated invoice audit intelligence** built for **Pacific Lines** (a shipping company). It automates the review of vendor invoices against pre-defined audit rules, uses AI to classify invoice exception scenarios, and escalates findings to the audit team.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS 4.1, Chart.js, Motion (animations), Lucide React |
| Backend | Node.js + Express.js (port 3001) |
| Database | SQLite via better-sqlite3 (WAL mode, recreated on server start) |
| AI/LLM | OpenAI GPT-4o or Azure OpenAI (for Check 4 classification) |
| File I/O | XLSX (Excel parsing), Multer (uploads), Nodemailer (emails) |
| Dev Tools | Vite (dev server, port 3000), TypeScript ~5.8.2, ESM modules |

---

## Folder Structure

```
03_PoC_output/
├── src/
│   ├── App.tsx          # Monolithic React component — all 7 screens (~3,357 lines)
│   ├── types.ts         # Shared TypeScript interfaces for API responses
│   ├── main.tsx         # React DOM entry point
│   └── index.css        # Global Tailwind styles
├── server/
│   ├── index.js         # Express app setup, route mounting, error handling
│   ├── db.js            # SQLite schema initialization (4 tables)
│   ├── email.js         # Nodemailer wrapper (Gmail or stub)
│   ├── auditiq.db       # SQLite database file
│   ├── routes/
│   │   ├── upload.js    # POST /api/upload — Excel parsing & ingestion
│   │   ├── invoices.js  # GET /api/invoices, GET /api/invoices/:serial
│   │   ├── audit.js     # GET /api/audit/status — progress polling
│   │   ├── resolve.js   # POST /api/resolve, /api/resolve/undo, /api/resolve/send
│   │   ├── alerts.js    # GET /api/alerts — alerts & escalations + KPIs
│   │   └── config.js    # GET/POST /api/config — AI provider status
│   └── audit/
│       ├── engine.js    # Audit orchestrator (processes rows in chunks of 20)
│       ├── check1.js    # Check 1: Terminal Having FD Code
│       ├── check2.js    # Check 2: Depot Having ND Code
│       ├── check3.js    # Check 3: Positive in DC Code
│       ├── check4.js    # Check 4: Auto Cost Code With Manual Values (AI)
│       └── costCodes.js # Predefined auto cost code list (27 codes)
├── dist/                # Vite build output
├── package.json
├── vite.config.ts       # React plugin, Tailwind, proxy /api/* → :3001
├── tsconfig.json
├── index.html
├── .env                 # Gmail, OpenAI/Azure keys
└── .env.example
```

---

## Screens (7 total)

### 1. Dashboard (`dashboard`)
High-level KPI overview.
- **KPI Cards (4):** Total Invoices Audited, Amount Cleared, Amount in Contention, Avg. Resolution Time
- **Charts:** Doughnut (Audit Status Distribution), Bar (Contention by Region)
- **Regional Summary Table:** 7 regions × metrics (Total, Audited, Cleared, Query Raised, Pending, Contention, Aging)
- **Right Side Panel:** System alert cards + Recent insights + "View All Alerts" button

---

### 2. Invoice Queue (`queue`)
Upload invoices and browse the audit queue.
- **Upload Button** + hidden `.xlsx` file input
- **Upload Progress Bar** — spinner, status message, % progress, rows counter
- **KPI Tiles (4):** Total, Cleared, Audit Failed, Validation Failed
- **Invoice Type Tabs:** TES (active), TRS, PSO (Coming Soon)
- **Filter Bar:** Status dropdown + search input
- **Data Table:** Row Serial, Invoice No, Checks (P/F/U/T), Audit Status badge, Cost Office, VVD, Contract Rate, Cost Code, View button
- **Pagination:** Prev/Next with page counter
- **Upload Type Modal:** Choose between TES / TRS / PSO invoice types

---

### 3. Case View (`case`)
Detailed audit breakdown for a single invoice.
- **Header Info Tiles (4):** Audit Status, Checks summary, Amount in Contention, Ageing (Days)
- **Invoice Details Section (collapsible, 4 cards):** Invoice Identity, Vessel & Voyage, Dates & Reference, Cost & Financials
- **Audit Checklist Panel:** 4 active checks (Passed / Failed / Unvalidated / N/A / Query Sent / Manually Resolved) + 11 Coming Soon checks
- **Audit Trail Log:** Timeline showing full resolution history per check
- **Right Slide-In Panel (when a check is selected):**
  - Audit trail steps for the selected check
  - **Option A — Send Query Email:** To / CC / Body fields + "Approve & Send" button
  - **Option B — Validate Manually:** Resolution type dropdown, notes textarea, proof upload area, "Mark as Passed" button

---

### 4. Alerts & Escalation (`alerts`)
Triage invoices requiring action.
- **KPI Header (3 tiles):** Total Requiring Action, Awaiting Response, Average Ageing
- **Alerts Tab:** Cards per failed invoice — Row Serial, Invoice #, Vendor, Cost Code, Amount, Ageing, failing checks with badges, "Take Action" button
- **Escalations Tab:** Blue-themed cards per queried invoice showing email thread history and timestamps

---

### 5. Audit Configuration (`config`)
Configure audit behavior (marked "Restricted Access").
- **Audit Checklist Section:** 3-column checkbox list (TES / TRS / PSO) to enable/disable checks per invoice type
- **Region-Level Matrix:** Regions × Checks matrix + Regional Threshold Override inputs (7 regions)
- **Schedule & Trigger Section:** Frequency (Daily/Weekly/Monthly), date range, run time, trigger mode, invoice priority checkboxes
- **AI Classification Engine Section:** Provider radio (Google GenAI / OpenAI), API key input, model dropdown
- **Audit Run History Table:** Past run records
- **Confirmation Modal:** Summary grid + optional target date/time + Confirm/Cancel

---

### 6. Artefacts (`artefacts`)
Links to reports and external resources.
- **Dashboard Cards (2-col grid):** Thumbnail + title + description + "Open Dashboard →" (Tableau links)
- **External Resources Section:** LMS card + SharePoint card with hover animations

---

### 7. Logs (`logs`)
Real-time audit engine processing feed.
- **Top Panel:** Animated "Agent is thinking..." — pulsing dots, amber terminal icon with glow, blinking timestamp
- **Bottom Panel:** Log table (Time / Event / Type) with color-coded badges — blue `info`, green `success`, amber `warning`

---

## Core Business Logic — Audit Checks

| # | Check Name | Rule | Status if Triggered |
|---|-----------|------|-------------------|
| 1 | Terminal Having FD Code | depot_type = Terminal AND cost_code contains "FD" | Audit Failed |
| 2 | Depot Having ND Code | depot_type = Depot AND cost_code contains "ND" | Audit Failed |
| 3 | Positive in DC Code | cost_code ends with "DC" AND manual_value > 0 | Audit Failed |
| 4 | Auto Cost Code With Manual Values | cost_code in auto list AND manual_value > 0 → AI classifies `calc_remark` | Passed / Failed / Validation Failed / Unvalidated (based on AI confidence & category) |

**11 additional checks** are planned but marked "Coming Soon."

**Invoice Statuses:** `Pending` → `All Clear` / `Audit Failed` / `Validation Failed` / `Query Raised`

---

## AI Integration (Check 4)

- **Providers:** OpenAI GPT-4o (`OPENAI_API_KEY`) or Azure OpenAI (`AZURE_OPENAI_ENDPOINT` + key + deployment)
- **Fallback:** Rule-based (detects "rounding off" keywords, defaults to "Other")
- **Input:** `calc_remark` text field from invoice row
- **Output:** One of 15 categories + confidence score (0–1)
- **Categories (15):** Storage for SOC Units, Different rate LCL units, Terminal Storage Days Mismatch, VVD Old/New rate mismatch, Credit notes, Short Billing, Agreement not exist in LMS, Rate mismatch, Exceptional agreement, Approval based cost, Wrong cost code, Adjustment/reversal entry, LMS sliding scale limitation, Rounding off, Other
- **Confidence logic:**
  - `< 0.5` → Validation Failed (manual review needed)
  - `>= 0.5` + "Rounding off" + value < 10 → Passed
  - `>= 0.5` + "Rounding off" + value >= 10 → Failed
  - `>= 0.5` + "Other" → Unvalidated
  - `>= 0.5` + category 1–13 → Passed (justification accepted)
- **Batch size:** Up to 20 rows per API call; temperature 0, max tokens 1000

---

## Backend API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload` | POST | Ingest `.xlsx` invoice file; triggers async audit engine |
| `/api/invoices` | GET | Paginated invoice list (filters: status, cost office, search) |
| `/api/invoices/:serial` | GET | Single invoice detail + all check results + audit trail |
| `/api/audit/status` | GET | Poll audit engine progress (for upload progress bar) |
| `/api/resolve` | POST | Manually mark a failing check as Passed |
| `/api/resolve/undo` | POST | Undo a manual resolution |
| `/api/resolve/send` | POST | Send vendor query email; moves invoice to Query Raised |
| `/api/alerts` | GET | Alerts & escalations + KPI tiles |
| `/api/config/ai-provider` | GET | Check AI provider configuration status |
| `/api/stats` | GET | Dashboard counts (total, cleared, failed, validation, pending) |
| `/api/health` | GET | Health check |

---

## Database Schema (SQLite — 4 tables)

### `uploads`
File upload metadata: `id`, `filename`, `row_count`, `uploaded_at`

### `invoice_rows`
Parsed invoice data: `row_serial` (unique), `upload_id`, `invoice_no`, `cost_office`, `vendor`, `vvd`, `yard_code`, `csr_no`, `atb_date`, `depot_type`, `cost_code`, `currency`, `calc_remark`, `contract_rate`, `manual_value`, `issue_date`, `raw_json`, `audit_status`, `created_at`

### `audit_results`
Check outcomes per row: `id`, `row_serial`, `check_number` (1–4), `check_name`, `status` (Passed/Failed/Validation Failed/Unvalidated), `detail`, `ai_category`, `created_at`

### `resolutions`
Manual actions & email history: `id`, `row_serial`, `check_number`, `resolution_type`, `resolution_note`, `original_status`, `resolved_by`, `resolved_at`

---

## Navigation Flow

```
Dashboard
  └── View All Alerts → Alerts & Escalation

Invoice Queue
  ├── Upload File → Invoice Type Modal → File Input
  └── View → Case View
        ├── Select Check → Slide-In Panel
        │     ├── Send Query Email
        │     └── Validate Manually
        └── Back to Queue

Alerts & Escalation
  ├── Alerts Tab → Take Action → Case View
  └── Escalations Tab → Email Thread

Audit Configuration
  ├── Schedule Audit → Confirmation Modal
  └── Start Now → Confirmation Modal

Artefacts → External links (Tableau, LMS, SharePoint)

Logs → Real-time audit engine feed
```

---

## Shared Helper Components (in `src/App.tsx`)

`SidebarItem`, `KPITile`, `KPICard`, `AuditStatusBadge`, `StatusPill`, `DetailItem`, `TimelineItem`, `AuditStepTrail`, `AuditStep`, `DashboardAlertItem`, `SummaryItem`, `SummaryTile`, `ComingSoon`, `ConfigSection`, `CheckRow`, `RegionMatrixRow`, `ThresholdItem`, `PriorityCheckbox`, `ScenarioRow`, `Toggle`, `AlertCard`, `EscalationCard`, `ThreadRow`, `FindingSidePanel`, `SidePanelStep`, `CaseAccordionCard`

---

## Running the App

```bash
# Backend (port 3001)
node server/index.js

# Frontend (port 3000, proxies /api/* to :3001)
npm run dev

# Production build
npm run build
```
