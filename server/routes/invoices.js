const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/invoices — paginated list
router.get('/', (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(200, parseInt(req.query.limit) || 50);
  const offset = (page - 1) * limit;

  const status     = req.query.status     || '';
  const costOffice = req.query.costOffice || '';
  const search     = req.query.search     || '';

  const conditions = [];
  const params = [];

  if (status)     { conditions.push('r.audit_status = ?');                             params.push(status); }
  if (costOffice) { conditions.push('r.cost_office = ?');                               params.push(costOffice); }
  if (search)     { conditions.push('(r.row_serial LIKE ? OR r.invoice_no LIKE ?)');   params.push(`%${search}%`, `%${search}%`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) AS n FROM invoice_rows r ${where}`).get(...params).n;

  const rows = db.prepare(`
    SELECT
      r.row_serial,
      r.invoice_no,
      r.cost_office,
      r.vendor,
      r.vvd,
      r.depot_type,
      r.contract_rate,
      r.issue_date,
      r.cost_code,
      r.manual_value,
      r.audit_status,
      COALESCE(SUM(a.status = 'Passed'),           0) AS audit_passed,
      COALESCE(SUM(a.status = 'Failed'),            0) AS audit_failed,
      COALESCE(SUM(a.status = 'Validation Failed'), 0) AS audit_unvalidated,
      COALESCE(COUNT(a.id),                         0) AS audit_total
    FROM invoice_rows r
    LEFT JOIN audit_results a ON a.row_serial = r.row_serial
    ${where}
    GROUP BY r.row_serial
    ORDER BY r.row_serial ASC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({ rows, total, page, limit, totalPages: Math.ceil(total / limit) });
});

// GET /api/invoices/:serial — single row + checks
router.get('/:serial', (req, res) => {
  const row = db.prepare('SELECT * FROM invoice_rows WHERE row_serial = ?').get(req.params.serial);
  if (!row) return res.status(404).json({ error: true, message: 'Row not found.' });

  const checks = db.prepare(
    'SELECT * FROM audit_results WHERE row_serial = ? ORDER BY check_number'
  ).all(req.params.serial);

  const resolutions = db.prepare(
    'SELECT * FROM resolutions WHERE row_serial = ? ORDER BY resolved_at DESC'
  ).all(req.params.serial);

  res.json({ ...row, checks, resolutions });
});

module.exports = router;
