// Run: node server/seed.js
// Generates ~200 synthetic invoice rows and runs the audit engine for demo purposes.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const db = require('./db');
const engine = require('./audit/engine');

const DEPOT_TYPES = ['Terminal', 'Depot', 'CFS', 'ICD'];
const VENDORS = ['Maersk Line', 'COSCO Shipping', 'Hapag-Lloyd', 'MSC', 'CMA CGM', 'PIL', 'Evergreen', 'ONE'];
const COST_OFFICES = ['SIN-01', 'HAM-01', 'SHA-08', 'MUM-03', 'DXB-01', 'ROT-02', 'HKG-04', 'SAN-05'];
const COST_CODES = [
  'SRFDFL', 'SRNDFL', 'SRNDMT', 'CGCUFL', 'CGCUMT',
  'TMFDFL', 'TMNDFL', 'TMNDMT',
  'TESTFD', 'TESTND', 'TESTDC', 'TESTXX',
  'THC001', 'THC002', 'DEM001', 'DET001', 'PORT01',
];
const REMARKS = [
  'rounding off', 'system round off', 'round of error', 'standard charge',
  'miscellaneous adjustment', 'port surcharge', 'fuel surcharge', null, null, null,
];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo = 60) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString().split('T')[0];
}

const uploadId = db.prepare("INSERT INTO uploads (filename, row_count) VALUES ('seed_data.xlsx', 200)").run().lastInsertRowid;

const insertRow = db.prepare(`
  INSERT OR IGNORE INTO invoice_rows
    (row_serial, upload_id, invoice_no, cost_office, vendor, depot_type, cost_code, calc_remark, manual_value, issue_date, raw_json)
  VALUES
    (@row_serial, @upload_id, @invoice_no, @cost_office, @vendor, @depot_type, @cost_code, @calc_remark, @manual_value, @issue_date, @raw_json)
`);

const rows = [];
for (let i = 1; i <= 200; i++) {
  const depotType = randomElement(DEPOT_TYPES);
  const costCode = randomElement(COST_CODES);
  const manualValue = Math.random() > 0.4 ? parseFloat((Math.random() * 200).toFixed(2)) : 0;

  rows.push({
    row_serial:   `ROW-${String(i).padStart(5, '0')}`,
    upload_id:    uploadId,
    invoice_no:   `INV-2026-${5000 + i}`,
    cost_office:  randomElement(COST_OFFICES),
    vendor:       randomElement(VENDORS),
    depot_type:   depotType,
    cost_code:    costCode,
    calc_remark:  randomElement(REMARKS),
    manual_value: manualValue,
    issue_date:   randomDate(90),
    raw_json:     JSON.stringify({ seed: true }),
  });
}

db.transaction((r) => r.forEach(row => insertRow.run(row)))(rows);
db.prepare('UPDATE uploads SET row_count = 200 WHERE id = ?').run(uploadId);

console.log('Inserted 200 seed rows. Running audit engine...');
engine.run(uploadId);

const stats = db.prepare(`
  SELECT COUNT(*) AS total,
         SUM(audit_status = 'Cleared') AS cleared,
         SUM(audit_status = 'Audit Failed') AS auditFailed,
         SUM(audit_status = 'Validation Failed') AS validationFailed
  FROM invoice_rows
`).get();

console.log('Seed complete:', stats);
