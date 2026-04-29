const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/alerts?tab=alerts|escalations
router.get('/', (req, res) => {
  const tab = req.query.tab === 'escalations' ? 'escalations' : 'alerts';

  // KPI: count invoices needing action (Audit Failed + Validation Failed)
  const totalRequiringAction = db.prepare(`
    SELECT COUNT(DISTINCT row_serial) AS n
    FROM invoice_rows
    WHERE audit_status IN ('Audit Failed', 'Validation Failed')
  `).get().n;

  // Awaiting response: invoices escalated via email (Query Raised)
  const awaitingResponse = db.prepare(`
    SELECT COUNT(*) AS n FROM invoice_rows WHERE audit_status = 'Query Raised'
  `).get().n;

  const kpi = {
    totalRequiringAction: totalRequiringAction || 0,
    awaitingResponse: awaitingResponse || 0,
    avgAging: 0,
  };

  if (tab === 'alerts') {
    const rows = db.prepare(`
      SELECT r.row_serial, r.invoice_no, r.cost_office, r.vendor,
             r.cost_code, r.manual_value, r.issue_date, r.audit_status
      FROM invoice_rows r
      WHERE r.audit_status IN ('Audit Failed', 'Validation Failed')
      ORDER BY r.row_serial
      LIMIT 100
    `).all();

    const cards = rows.map(row => {
      // Return failing checks AND previously-failing-but-manually-resolved checks (for undo)
      const checks = db.prepare(`
        SELECT ar.check_number, ar.check_name, ar.status, ar.detail,
               res.id           AS resolution_id,
               res.resolution_type,
               res.original_status
        FROM audit_results ar
        LEFT JOIN resolutions res
          ON  res.row_serial    = ar.row_serial
          AND res.check_number  = ar.check_number
          AND res.resolution_type != 'email_sent'
        WHERE ar.row_serial = ?
          AND (
            ar.status IN ('Failed', 'Validation Failed')
            OR (ar.status = 'Passed' AND res.original_status IN ('Failed', 'Validation Failed'))
          )
        ORDER BY ar.check_number
      `).all(row.row_serial);

      return { ...row, aging: 0, failedChecks: checks };
    });

    res.json({ tab, kpi, cards });

  } else {
    // Escalations: invoices where audit_status = 'Query Raised'
    const rows = db.prepare(`
      SELECT r.row_serial, r.invoice_no, r.cost_office, r.vendor,
             r.cost_code, r.manual_value, r.issue_date, r.audit_status
      FROM invoice_rows r
      WHERE r.audit_status = 'Query Raised'
      ORDER BY r.row_serial
      LIMIT 100
    `).all();

    const cards = rows.map(row => {
      const threads = db.prepare(`
        SELECT check_number, resolution_note, resolved_at
        FROM resolutions
        WHERE row_serial = ? AND resolution_type = 'email_sent'
        ORDER BY resolved_at DESC
      `).all(row.row_serial);

      return { ...row, aging: 0, threads };
    });

    res.json({ tab, kpi, cards });
  }
});

module.exports = router;
