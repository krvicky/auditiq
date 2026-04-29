# AuditIQ — Invoice Audit Intelligence Platform

**Proof of Concept | Pacific Lines | Audit Team — India**

---

## Business Context

Shipping lines process thousands of vendor invoices every month covering terminal handling, port service operations, and transshipment costs. The audit team manually reviews each invoice against contract rates, cost codes, and operational records — a process that is time-consuming, error-prone, and difficult to track at scale.

**AuditIQ** is a Proof of Concept (PoC) built to demonstrate how automated audit intelligence can be applied to the invoice review workflow. It ingests raw Excel-based invoice data, runs a configurable set of audit checks against each row, and surfaces exceptions to the team through a structured queue, case management view, and escalation workflow.

### The Problem It Solves

| Current Pain Point | AuditIQ Approach |
|---|---|
| Manual line-by-line review of large invoice files | Automated audit engine processes all rows on upload |
| No structured way to track which invoices have issues | Status-driven queue (All Clear / Audit Failed / Validation Failed / Query Raised) |
| Audit findings scattered across email threads and spreadsheets | Centralised Case View with audit trail per invoice |
| No visibility into how many invoices are pending or disputed | Live KPI dashboard and Alerts & Escalation screen |
| Query emails sent ad-hoc with no tracking | In-app "Approve & Send" with thread history in Escalations tab |

---

## Key Features

### Invoice Queue
Paginated list of all uploaded invoices with their audit status, cost office, vendor, and amount. Supports filtering by status and cost office, and free-text search.

### Case View
Detailed audit view for a single invoice row, showing:
- Overall audit status (All Clear / Audit Failed / Validation Failed / Query Raised)
- Per-check breakdown across the active audit checklist
- Audit trail log with timestamps for all resolutions and email actions
- Side panel with two resolution paths per failing check:
  - **Option A — Send Query Email:** compose and send a query to the vendor; invoice moves to Escalations
  - **Option B — Validate Manually:** select a resolution type (Data Entry Error, Approved Exception, etc.) and mark the check as passed

### Alerts & Escalation
- **Alerts tab:** all invoices with Audit Failed or Validation Failed status; each card shows the failing checks with a "Take Action →" link to Case View
- **Escalations tab:** all invoices where a query email has been sent (status = Query Raised); shows the email thread history per invoice
- KPI tiles: Total Requiring Action, Awaiting Response, Average Ageing

### Dashboard
High-level summary of the audit queue: total invoices, cleared, failed, validation issues, and pending. Includes charts for status distribution and cost office breakdown.

### Audit Configuration
Placeholder screen for managing audit rules and cost code mappings (coming soon).

### Artefacts & Logs
Placeholder screens for audit reports and system logs (coming soon).

---

## Audit Checks (Active)

| # | Check Name | Trigger Condition |
|---|---|---|
| 1 | Terminal Having FD Code | Depot type is FD (Full Depot) |
| 2 | Depot Having ND Code | Depot type is ND (Non-Depot) |
| 3 | Positive in DC Code | Cost code is in the DC category |
| 4 | Auto Cost Code With Manual Values | Cost code is in the auto-rate list but a manual value is present |

Checks 5–15 (Incorrect Dates, Positive in ADJ Invoice, >180 Days, Common VVD, Wrong Currency, Wrong Cost Code, Wrong Rate, Wrong UI, Wrong/Excess Costing, Manual Verification, Partner Vessel Re-stow) are visible in the UI as "Coming Soon."

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (React 19 + TypeScript)        │
│  Vite dev server  →  http://localhost:3000│
│                                         │
│  /src/App.tsx  — all screens & components│
│  /src/types.ts — shared API types        │
└───────────────┬─────────────────────────┘
                │  /api/* (Vite proxy)
┌───────────────▼─────────────────────────┐
│  Backend (Node.js + Express)             │
│  http://localhost:3001                   │
│                                         │
│  routes/upload.js   — Excel ingestion   │
│  routes/invoices.js — queue & detail    │
│  routes/audit.js    — engine status     │
│  routes/resolve.js  — resolve / email   │
│  routes/alerts.js   — alerts & escals   │
│  audit/engine.js    — audit check logic │
│  db.js              — SQLite schema      │
│  email.js           — nodemailer stub   │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│  SQLite (better-sqlite3)                 │
│  server/auditiq.db  (recreated on start) │
│                                         │
│  Tables: uploads, invoice_rows,          │
│          audit_results, resolutions      │
└─────────────────────────────────────────┘
```

> **Note:** The database is wiped and recreated on every server start. This is intentional for the PoC to always start with a clean state.

---

## Running Locally

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Install dependencies
```bash
npm install
```

### Start the backend server
```bash
node server/index.js
```
Server runs on **http://localhost:3001**

### Start the frontend (separate terminal)
```bash
npm run dev
```
Frontend runs on **http://localhost:3000**

### Upload an invoice file
1. Open http://localhost:3000
2. Navigate to **Invoice Queue**
3. Click **Upload File**, select a `.xlsx` file (sheet named `Source` or `Sheet1`)
4. The audit engine runs automatically; the queue refreshes when complete

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|---|---|---|
| `GMAIL_USER` | No | Gmail address for sending query emails |
| `GMAIL_APP_PASSWORD` | No | Gmail app password (not your account password) |

If these are not set, email sending is **stubbed** — the email body is logged to the server console and the invoice still moves to Escalations.

---

## Invoice Input Format

| Column Header | Description |
|---|---|
| Row Serial | Unique identifier for the invoice row |
| Invoice No | Vendor invoice number |
| Cost Office | Office responsible for the cost |
| Vendor | Vendor / service provider name |
| VVD | Vessel Voyage Destination |
| Yard Code | Yard reference code |
| CSR No | Customer Service Request number |
| ATB Date | Actual Time of Berthing |
| Depot Type | FD / ND / DC etc. |
| Contract Rate | Agreed contract rate |
| Currency | Invoice currency |
| Cost Code | Cost classification code |
| Calc Remark | Calculation remark / description |
| Manual Value | Manually entered invoice amount |
| Issue Date | Invoice issue date |

---

## Audit Status Reference

| Status | Meaning |
|---|---|
| All Clear | All automated checks passed |
| Audit Failed | One or more checks failed (hard failure) |
| Validation Failed | One or more checks require manual validation |
| Query Raised | A query email has been sent to the vendor |
| Pending | Audit engine has not yet processed this row |
