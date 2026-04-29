const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'auditiq.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Drop then recreate on every start — ensures schema is always current, data always fresh
db.exec(`
  DROP TABLE IF EXISTS resolutions;
  DROP TABLE IF EXISTS audit_results;
  DROP TABLE IF EXISTS invoice_rows;
  DROP TABLE IF EXISTS uploads;

  CREATE TABLE uploads (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    filename        TEXT,
    row_count       INTEGER,
    uploaded_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE invoice_rows (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    row_serial      TEXT NOT NULL UNIQUE,
    upload_id       INTEGER,
    invoice_no      TEXT,
    cost_office     TEXT,
    vendor          TEXT,
    vvd             TEXT,
    yard_code       TEXT,
    csr_no          TEXT,
    atb_date        TEXT,
    depot_type      TEXT,
    contract_rate   REAL,
    currency        TEXT,
    cost_code       TEXT,
    calc_remark     TEXT,
    manual_value    REAL,
    issue_date      TEXT,
    raw_json        TEXT,
    audit_status    TEXT DEFAULT 'Pending',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE audit_results (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    row_serial      TEXT NOT NULL,
    check_number    INTEGER NOT NULL,
    check_name      TEXT NOT NULL,
    status          TEXT NOT NULL,
    detail          TEXT,
    ai_category     TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE resolutions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    row_serial      TEXT NOT NULL,
    check_number    INTEGER NOT NULL,
    resolution_type TEXT,
    resolution_note TEXT,
    original_status TEXT,
    resolved_by     TEXT DEFAULT 'Audit Team',
    resolved_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
