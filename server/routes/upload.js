const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const db = require('../db');
const engine = require('../audit/engine');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

// Header name → DB field mapping (case-insensitive)
const COLUMN_MAP = {
  'invoice office':               'cost_office',
  'depot':                        'depot_type',
  'vendor / port authority name': 'vendor',
  'vendor/port authority name':   'vendor',
  'invoice no':                   'invoice_no',
  'invoice confirm date':         'issue_date',
  'cost code':                    'cost_code',
  'calc remark':                  'calc_remark',
  'manual':                       'manual_value',
  'vvd':                          'vvd',
  'yard code':                    'yard_code',
  'csr_no':                       'csr_no',
  'csr no':                       'csr_no',
  'atb date':                     'atb_date',
  'contract rate':                'contract_rate',
  'currency':                     'currency',
  'vendor':                       'vendor',
  'cost office':                  'cost_office',
};

function normaliseDate(raw) {
  if (!raw) return null;
  if (typeof raw === 'number') {
    const date = XLSX.SSF.parse_date_code(raw);
    if (!date) return null;
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parts = s.split(/[\/-]/);
  if (parts.length === 3) {
    const [a, b, c] = parts;
    if (c.length === 4) return `${c}-${b.padStart(2,'0')}-${a.padStart(2,'0')}`;
  }
  return s || null;
}

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: true, message: 'No file uploaded.' });

  let workbook;
  try {
    workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: false });
  } catch {
    return res.status(400).json({ error: true, message: 'Could not parse file. Ensure it is a valid .xlsx or .xlsm file.' });
  }

  // Find the data sheet — accept "Source" or "Sheet1" (case-insensitive)
  const ACCEPTED_SHEETS = ['source', 'sheet1'];
  const sourceSheetName = workbook.SheetNames.find(
    name => ACCEPTED_SHEETS.includes(name.trim().toLowerCase())
  );

  if (!sourceSheetName) {
    return res.status(400).json({
      error: true,
      message: `No data sheet found. Expected "Source" or "Sheet1". File contains: ${workbook.SheetNames.join(', ')}`
    });
  }

  const sheet = workbook.Sheets[sourceSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });

  if (rows.length === 0) {
    return res.status(400).json({ error: true, message: 'The "Source" sheet is empty or has no data rows.' });
  }

  // Detect headers by name (case-insensitive)
  const sampleRow = rows[0];
  const headerMap = {};
  for (const key of Object.keys(sampleRow)) {
    const normalised = key.toLowerCase().trim();
    if (COLUMN_MAP[normalised]) headerMap[key] = COLUMN_MAP[normalised];
  }

  const requiredFields = ['cost_office', 'cost_code'];
  for (const field of requiredFields) {
    if (!Object.values(headerMap).includes(field)) {
      const expected = Object.entries(COLUMN_MAP).find(([, v]) => v === field)?.[0] || field;
      return res.status(400).json({ error: true, message: `Required column "${expected}" not found in the Source sheet.` });
    }
  }

  // Wipe previous session — each upload is a clean slate
  engine.reset();
  db.exec(`
    DELETE FROM resolutions;
    DELETE FROM audit_results;
    DELETE FROM invoice_rows;
    DELETE FROM uploads;
  `);

  // Insert upload record (fast — one row)
  const uploadId = db.prepare('INSERT INTO uploads (filename, row_count) VALUES (?, ?)').run(req.file.originalname, rows.length).lastInsertRowid;

  // Respond immediately — rowCount is known from sheet_to_json, no need to wait for inserts.
  // This commits the response to the kernel TCP buffer before any blocking work starts,
  // preventing the OS/proxy from dropping the stalled connection ("Failed to fetch").
  res.json({ uploadId, rowCount: rows.length });

  // Insert rows and run audit engine asynchronously after the response is sent
  setImmediate(async () => {
    try {
      const insertRow = db.prepare(`
        INSERT INTO invoice_rows
          (row_serial, upload_id, invoice_no, cost_office, vendor, vvd, yard_code, csr_no, atb_date,
           depot_type, contract_rate, currency, cost_code, calc_remark, manual_value, issue_date, raw_json)
        VALUES
          (@row_serial, @upload_id, @invoice_no, @cost_office, @vendor, @vvd, @yard_code, @csr_no, @atb_date,
           @depot_type, @contract_rate, @currency, @cost_code, @calc_remark, @manual_value, @issue_date, @raw_json)
      `);

      const BATCH = 500;
      let inserted = 0;

      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        db.transaction((batchRows) => {
          for (const row of batchRows) {
            const serial = `ROW-${String(inserted + 1).padStart(5, '0')}`;
            const mapped = { row_serial: serial, upload_id: uploadId };

            for (const [origKey, dbField] of Object.entries(headerMap)) {
              let val = row[origKey];
              if (dbField === 'manual_value') {
                val = (val !== null && val !== '') ? Math.abs(parseFloat(val) || 0) : null;
              } else if (dbField === 'issue_date') {
                val = normaliseDate(val);
              } else {
                val = (val !== null && val !== '') ? String(val).trim() : null;
              }
              mapped[dbField] = val;
            }

            mapped.invoice_no   = mapped.invoice_no   ?? null;
            mapped.cost_office  = mapped.cost_office  ?? null;
            mapped.vendor       = mapped.vendor       ?? null;
            mapped.vvd           = mapped.vvd           ?? null;
            mapped.yard_code     = mapped.yard_code     ?? null;
            mapped.csr_no        = mapped.csr_no        ?? null;
            mapped.atb_date      = mapped.atb_date      ?? null;
            mapped.depot_type    = mapped.depot_type    ?? null;
            mapped.contract_rate = mapped.contract_rate ?? null;
            mapped.currency      = mapped.currency      ?? null;
            mapped.cost_code    = mapped.cost_code    ?? null;
            mapped.calc_remark  = mapped.calc_remark  ?? null;
            mapped.manual_value = mapped.manual_value ?? null;
            mapped.issue_date   = mapped.issue_date   ?? null;
            mapped.raw_json     = JSON.stringify(row);

            insertRow.run(mapped);
            inserted++;
          }
        })(batch);
      }

      db.prepare('UPDATE uploads SET row_count = ? WHERE id = ?').run(inserted, uploadId);
      await engine.run(uploadId);
    } catch (err) {
      console.error('[UPLOAD ASYNC ERROR]', err.message);
      engine.reset(); // prevent frontend polling indefinitely
    }
  });
});

module.exports = router;
