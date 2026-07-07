const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const { rowSerial, checkNumber } = req.query;
  if (!rowSerial || !checkNumber) {
    return res.status(400).json({ error: true, message: 'rowSerial and checkNumber are required' });
  }
  const rows = db.prepare(
    'SELECT * FROM comments WHERE row_serial = ? AND check_number = ? ORDER BY commented_at ASC'
  ).all(rowSerial, parseInt(checkNumber));
  res.json(rows);
});

router.post('/', (req, res) => {
  const { rowSerial, checkNumber, commentText, commentedBy = 'Audit Team' } = req.body;
  if (!rowSerial || !checkNumber || !commentText?.trim()) {
    return res.status(400).json({ error: true, message: 'rowSerial, checkNumber and commentText are required' });
  }

  const check = db.prepare(
    'SELECT check_name FROM audit_results WHERE row_serial = ? AND check_number = ?'
  ).get(rowSerial, parseInt(checkNumber));
  const checkName = check?.check_name || `Check #${checkNumber}`;

  const insertComment = db.prepare(
    'INSERT INTO comments (row_serial, check_number, comment_text, commented_by) VALUES (?, ?, ?, ?)'
  );
  const insertResolution = db.prepare(
    `INSERT INTO resolutions (row_serial, check_number, resolution_type, resolution_note, resolved_by)
     VALUES (?, ?, 'comment', ?, ?)`
  );

  const doInsert = db.transaction(() => {
    const info = insertComment.run(rowSerial, parseInt(checkNumber), commentText.trim(), commentedBy);
    insertResolution.run(rowSerial, parseInt(checkNumber), commentText.trim(), commentedBy);
    return info.lastInsertRowid;
  });

  const commentId = doInsert();
  res.json({ ok: true, commentId });
});

module.exports = router;
