const { OpenAI, AzureOpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const { AUTO_COST_CODES } = require('./costCodes');

function isLLMEnabled() {
  try {
    const flag = fs.readFileSync(path.join(__dirname, '..', '..', 'call_llm.txt'), 'utf8').trim().toLowerCase();
    return flag === 'yes';
  } catch {
    return true; // default to enabled if file is missing
  }
}

const KNOWN_CATEGORIES = [
  'Storage for SOC Units',
  'Different rate LCL units',
  'Terminal Storage Days Mismatch - Over billed',
  'VVD belongs to Old rate and invoice reported in new rate',
  'Credit notes',
  'Short Billing by Terminal',
  'Agreement not exist in LMS',
  'Rate mismatch in agreement',
  'Exceptional agreement set up',
  'Approval based cost',
  'Wrong cost code used',
  'Adjustment entry - reversal and adjustment',
  'Limitation in LMS agreement module (sliding scale)',
  'Rounding off',
];
const ALL_CATEGORIES = [...KNOWN_CATEGORIES, 'Other'];

const SYSTEM_PROMPT = `You are an expert invoice auditor for a global container shipping company (Pacific Lines).

Your task is to classify free-text "Calc Remark" fields from vendor invoice line items. These remarks were entered manually by billing clerks to justify why a manual value exists against a cost code that is normally auto-calculated by the system (LMS — Liner Management System).

Classify each remark into EXACTLY ONE of the following 14 categories:

1. Storage for SOC Units
   — Use when the remark refers to storage charges for Shipper-Owned Containers (SOC). SOC containers are not owned by Pacific Lines, so storage billing rules differ from carrier-owned equipment.

2. Different rate LCL units
   — Use when the remark refers to LCL (Less than Container Load) cargo where the applied rate differs from the standard contracted rate. LCL charges are typically per CBM or per tonne and may vary by port or cargo type.

3. Terminal Storage Days Mismatch - Over billed
   — Use when the terminal has billed more storage days than the actual days the container was stored. This occurs due to gate-out date discrepancies or system date mismatches at the terminal.

4. VVD belongs to Old rate and invoice reported in new rate
   — Use when the vessel voyage date (VVD) falls within the validity period of an old contract/rate, but the invoice was raised using the new (current) contract rate. The manual value corrects this rate-version mismatch.

5. Credit notes
   — Use when the remark indicates a credit note, credit memo, credit adjustment, or reversal of a previously over-charged amount. The manual value represents a negative correction.

6. Short Billing by Terminal
   — Use when the terminal has under-billed Pacific Lines (charged less than the agreed contract rate), and a manual entry is required to capture the shortfall amount that was missed in the auto-calculation.

7. Agreement not exist in LMS
   — Use when no matching contract or rate agreement for this service/port/vendor combination exists in the LMS. The manual value represents the rate applied based on physical agreement outside the system.

8. Rate mismatch in agreement
   — Use when a rate agreement does exist in LMS, but the rate on the invoice differs from the rate stored in that agreement. The manual value corrects the difference between the billed rate and the contracted rate.

9. Exceptional agreement set up
   — Use when a special, one-off, or exceptional pricing arrangement was agreed upon outside the standard tariff (e.g., a one-time negotiated rate for a specific voyage, port, or cargo). This required manual setup and cannot be auto-calculated.

10. Approval based cost
    — Use when the cost was specifically approved by management or an authorised exception approver (e.g., regional manager approval, head office sign-off) and does not follow standard contracted rates. Remarks may mention approval, authorisation, or sign-off.

11. Wrong cost code used
    — Use when the wrong cost code was initially assigned to a line item, and a manual value is entered to correct the misallocation. The remark typically identifies the incorrect code and the correct one, or simply states the cost code was wrong.

12. Adjustment entry - reversal and adjustment
    — Use when the entry is a general accounting adjustment, a reversal of a previously posted entry, or a correction entry that does not fit into a more specific category. Includes debit/credit adjustments, reposting corrections, and period-end adjustments.

13. Limitation in LMS agreement module (sliding scale)
    — Use when the LMS agreement module cannot handle sliding-scale rate structures (i.e., rates that change based on volume bands, duration tiers, or graduated pricing). The manual value represents the correct amount calculated outside the system.

14. Rounding off
    — Use when the remark explicitly mentions rounding, round-off, rounding difference, or decimal adjustment. Typically the manual value is very small (less than 10 in local currency) due to system rounding constraints.

15. Other
    — Use ONLY if the remark genuinely and clearly does not fit any of the above 14 categories, OR if the remark is completely blank, gibberish, or uninterpretable.

CONFIDENCE SCORING RULES:
- 0.90 – 1.00 : The remark clearly and unambiguously matches one category. Key terms are present.
- 0.70 – 0.89 : The remark likely matches but has some ambiguity or is phrased indirectly.
- 0.50 – 0.69 : The remark could match, but the language is vague or could fit 2 categories.
- Below 0.50  : The remark is too vague, blank, contradictory, or fits no category well. Assign "Other" and score low.

IMPORTANT RULES:
- The "category" field must be the EXACT string from the numbered list above (case-sensitive).
- Never invent a category not in the list.
- If a remark is blank or "(blank)", return "Other" with confidence 0.1.`;

function buildClient() {
  if (process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY) {
    return {
      client: new AzureOpenAI({
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: process.env.AZURE_OPENAI_KEY,
        apiVersion: '2024-02-01',
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
      }),
      model: process.env.AZURE_OPENAI_DEPLOYMENT,
      provider: 'azure',
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      model: 'gpt-4o',
      provider: 'openai',
    };
  }
  return null;
}

// Classifies a chunk of up to 20 rows in a single API call.
// Only rows with an auto cost code AND a non-zero manual value are sent to AI.
// Returns Map<row_serial, { category, confidence }> for those rows.
async function classifyChunk(rows) {
  const results = new Map();
  const candidates = rows.filter(r => {
    const code = (r.cost_code || '').trim().toUpperCase();
    const value = Math.abs(parseFloat(r.manual_value) || 0);
    return AUTO_COST_CODES.has(code) && value > 0;
  });

  if (candidates.length === 0) return results;

  // Stub fallback — used when call_llm.txt is "no" or no AI provider is configured
  const useStub = !isLLMEnabled() || !buildClient();
  if (useStub) {
    for (const r of candidates) {
      const norm = (r.calc_remark || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      const isRoundOff = ['round', 'rounding', 'roundoff', 'rnd off', 'round of'].some(p => norm.includes(p));
      results.set(r.row_serial, { category: isRoundOff ? 'Rounding off' : 'Other', confidence: isRoundOff ? 0.8 : 0.3 });
    }
    return results;
  }

  const clientInfo = buildClient();

  const { client, model } = clientInfo;

  const remarksList = candidates
    .map((r, i) => `${i + 1}. "${r.calc_remark || '(blank)'}"`)
    .join('\n');

  const userMessage =
    `Classify each of the following calc remarks from vendor invoices.\n` +
    `Return a JSON object with a "classifications" array — one entry per remark, in the same order.\n\n` +
    `Remarks:\n${remarksList}\n\n` +
    `Return format:\n` +
    `{ "classifications": [ { "index": 1, "category": "...", "confidence": 0.0 }, ... ] }`;

  let parsed;
  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 1000,
    });
    parsed = JSON.parse(response.choices[0].message.content);
  } catch {
    // On any failure mark all candidates as low-confidence Other
    for (const r of candidates) {
      results.set(r.row_serial, { category: 'Other', confidence: 0.1 });
    }
    return results;
  }

  const classifications = parsed.classifications || [];
  candidates.forEach((r, i) => {
    const entry = classifications.find(c => c.index === i + 1) || {};
    const category = ALL_CATEGORIES.includes(entry.category) ? entry.category : 'Other';
    const confidence = Math.max(0, Math.min(1, parseFloat(entry.confidence) || 0));
    results.set(r.row_serial, { category, confidence });
  });

  return results;
}

function runCheck4(row, aiResult) {
  const costCode = (row.cost_code || '').trim().toUpperCase();
  const PASS = {
    check_number: 4,
    check_name: 'Auto Cost Code With Manual Values',
    status: 'Passed',
    detail: null,
    ai_category: null,
  };

  if (!AUTO_COST_CODES.has(costCode)) return PASS;

  const value = Math.abs(parseFloat(row.manual_value) || 0);
  if (value === 0) return PASS;

  const { category, confidence } = aiResult;

  if (confidence < 0.5) {
    return {
      check_number: 4,
      check_name: 'Auto Cost Code With Manual Values',
      status: 'Validation Failed',
      detail: `Low-confidence classification (${Math.round(confidence * 100)}%): "${row.calc_remark || ''}"`,
      ai_category: category,
    };
  }

  if (category === 'Rounding off') {
    if (value < 10) {
      return { ...PASS, detail: `Rounding off — acceptable value: ${value}`, ai_category: category };
    }
    return {
      check_number: 4,
      check_name: 'Auto Cost Code With Manual Values',
      status: 'Failed',
      detail: `Rounding off — manual value ${value} exceeds threshold of 10`,
      ai_category: category,
    };
  }

  if (category === 'Other') {
    return {
      check_number: 4,
      check_name: 'Auto Cost Code With Manual Values',
      status: 'Unvalidated',
      detail: `Remark could not be classified: "${row.calc_remark || ''}"`,
      ai_category: 'Other',
    };
  }

  // One of the other 13 known categories — justification accepted
  return { ...PASS, detail: `Classified as: ${category}`, ai_category: category };
}

module.exports = { runCheck4, classifyChunk, buildClient };
