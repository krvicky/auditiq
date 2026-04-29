const express = require('express');
const db = require('../db');
const { sendEmail } = require('../email');

const router = express.Router();

function recomputeAuditStatus(rowSerial) {
  const checks = db.prepare(
    'SELECT status FROM audit_results WHERE row_serial = ?'
  ).all(rowSerial);

  let status = 'All Clear';
  for (const c of checks) {
    if (c.status === 'Failed') { status = 'Audit Failed'; break; }
    if (c.status === 'Validation Failed') status = 'Validation Failed';
  }
  db.prepare('UPDATE invoice_rows SET audit_status = ? WHERE row_serial = ?').run(status, rowSerial);
  return status;
}

// POST /api/resolve — mark a check as Passed manually
router.post('/', (req, res) => {
  const { rowSerial, checkNumber, type, note } = req.body;
  if (!rowSerial || !checkNumber || !type) {
    return res.status(400).json({ error: true, message: 'rowSerial, checkNumber, and type are required.' });
  }

  // Capture current check status before overwriting (needed for undo)
  const original = db.prepare(
    'SELECT status FROM audit_results WHERE row_serial = ? AND check_number = ?'
  ).get(rowSerial, checkNumber);

  db.prepare(`
    INSERT INTO resolutions (row_serial, check_number, resolution_type, resolution_note, original_status)
    VALUES (?, ?, ?, ?, ?)
  `).run(rowSerial, checkNumber, type, note || null, original?.status || null);

  db.prepare(`
    UPDATE audit_results SET status = 'Passed'
    WHERE row_serial = ? AND check_number = ?
  `).run(rowSerial, checkNumber);

  const newStatus = recomputeAuditStatus(rowSerial);
  res.json({ ok: true, newAuditStatus: newStatus });
});

// POST /api/resolve/undo — revert a manual resolution
router.post('/undo', (req, res) => {
  const { resolutionId } = req.body;
  if (!resolutionId) return res.status(400).json({ error: true, message: 'resolutionId is required.' });

  const resolution = db.prepare('SELECT * FROM resolutions WHERE id = ?').get(resolutionId);
  if (!resolution) return res.status(404).json({ error: true, message: 'Resolution not found.' });

  // Restore the check's original status in audit_results
  db.prepare('UPDATE audit_results SET status = ? WHERE row_serial = ? AND check_number = ?')
    .run(resolution.original_status, resolution.row_serial, resolution.check_number);

  // Mark as undone — store original type in note so audit trail can render both steps
  db.prepare("UPDATE resolutions SET resolution_type = 'undone', resolution_note = ? WHERE id = ?")
    .run(resolution.resolution_type, resolutionId);

  // Recompute the invoice's overall audit status
  const newStatus = recomputeAuditStatus(resolution.row_serial);
  res.json({ ok: true, newAuditStatus: newStatus });
});

// POST /api/email/send — send query email and mark invoice as Query Raised
// Mounted at both /api/resolve/send and /api/email/send
router.post('/send', async (req, res) => {
  const { rowSerial, checkNumber, to, cc, body } = req.body;
  if (!rowSerial || !checkNumber || !to) {
    return res.status(400).json({ error: true, message: 'rowSerial, checkNumber, and to are required.' });
  }

  const row = db.prepare('SELECT invoice_no, cost_code FROM invoice_rows WHERE row_serial = ?').get(rowSerial);
  const check = db.prepare('SELECT check_name FROM audit_results WHERE row_serial = ? AND check_number = ?').get(rowSerial, checkNumber);

  const subject = `Query on Invoice ${row?.invoice_no || rowSerial} — ${check?.check_name || 'Audit Check'}`;

  try {
    await sendEmail({ to, cc: cc || '', subject, body });
  } catch (err) {
    return res.status(500).json({ error: true, message: `Email failed: ${err.message}` });
  }

  db.prepare(`
    INSERT INTO resolutions (row_serial, check_number, resolution_type, resolution_note, resolved_by)
    VALUES (?, ?, 'email_sent', ?, 'Audit Team')
  `).run(rowSerial, checkNumber, `Email sent to ${to}`);

  // Move invoice to Escalations tab
  db.prepare("UPDATE invoice_rows SET audit_status = 'Query Raised' WHERE row_serial = ?")
    .run(rowSerial);

  res.json({ ok: true, subject });
});

module.exports = router;
