const db = require('../db');
const { runCheck1 } = require('./check1');
const { runCheck2 } = require('./check2');
const { runCheck3 } = require('./check3');
const { runCheck4, classifyChunk } = require('./check4');

// Progress state — polled by /api/audit/status
let auditProgress = { status: 'idle', processed: 0, total: 0 };

function getProgress() {
  return auditProgress;
}

function deriveAuditStatus(checkResults) {
  const statuses = checkResults.map(r => r.status);
  if (statuses.includes('Failed')) return 'Audit Failed';
  if (statuses.includes('Validation Failed') || statuses.includes('Unvalidated')) return 'Validation Failed';
  return 'All Clear';
}

async function run(uploadId) {
  const rows = db.prepare('SELECT * FROM invoice_rows WHERE upload_id = ?').all(uploadId);
  const total = rows.length;

  auditProgress = { status: 'running', processed: 0, total };

  const insertResult = db.prepare(`
    INSERT INTO audit_results (row_serial, check_number, check_name, status, detail, ai_category)
    VALUES (@row_serial, @check_number, @check_name, @status, @detail, @ai_category)
  `);

  const updateStatus = db.prepare(
    'UPDATE invoice_rows SET audit_status = ? WHERE row_serial = ?'
  );

  // Process rows in chunks of 20:
  // 1. One OpenAI API call classifies all remarks in the chunk
  // 2. Results are immediately written to DB
  // 3. Progress is updated after each chunk
  // This gives real-time progress updates and reduces API calls from N to N/20.
  const CHUNK = 20;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);

    const aiResults = await classifyChunk(chunk);

    db.transaction((chunkRows) => {
      for (const row of chunkRows) {
        const aiResult = aiResults.get(row.row_serial) ?? { category: 'Other', confidence: 1 };
        const checks = [
          runCheck1(row),
          runCheck2(row),
          runCheck3(row),
          runCheck4(row, aiResult),
        ];

        for (const result of checks) {
          insertResult.run({
            row_serial:   row.row_serial,
            check_number: result.check_number,
            check_name:   result.check_name,
            status:       result.status,
            detail:       result.detail || null,
            ai_category:  result.ai_category || null,
          });
        }

        updateStatus.run(deriveAuditStatus(checks), row.row_serial);
      }
    })(chunk);

    auditProgress.processed = Math.min(i + CHUNK, total);
  }

  auditProgress = { status: 'done', processed: total, total };
}

function reset() {
  auditProgress = { status: 'idle', processed: 0, total: 0 };
}

module.exports = { run, getProgress, reset };
