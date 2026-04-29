require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const db = require('./db');
const uploadRouter   = require('./routes/upload');
const invoicesRouter = require('./routes/invoices');
const auditRouter    = require('./routes/audit');
const resolveRouter  = require('./routes/resolve');
const alertsRouter   = require('./routes/alerts');
const configRouter   = require('./routes/config');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/upload',   uploadRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/audit',    auditRouter);
app.use('/api/resolve',  resolveRouter);
app.use('/api/email',    resolveRouter);
app.use('/api/alerts',   alertsRouter);
app.use('/api/config',   configRouter);

// Stats — top-level so frontend can call /api/stats
app.get('/api/stats', (_, res) => {
  const row = db.prepare(`
    SELECT
      COUNT(*)                                 AS total,
      COALESCE(SUM(audit_status = 'All Clear'), 0)         AS cleared,
      COALESCE(SUM(audit_status = 'Audit Failed'), 0)      AS auditFailed,
      COALESCE(SUM(audit_status = 'Validation Failed'), 0) AS validationFailed,
      COALESCE(SUM(audit_status = 'Pending'), 0)           AS pending
    FROM invoice_rows
  `).get();
  res.json(row);
});

// Health check
app.get('/api/health', (_, res) => res.json({ ok: true }));

// Global error handler — always returns JSON so the frontend can parse it
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message, err.stack);
  res.status(500).json({ error: true, message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AuditIQ server running on http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION — server kept alive]', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION — server kept alive]', reason);
});
