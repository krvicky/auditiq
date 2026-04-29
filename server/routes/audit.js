const express = require('express');
const engine = require('../audit/engine');

const router = express.Router();

// GET /api/audit/status — polled by frontend during upload
router.get('/status', (req, res) => {
  res.json(engine.getProgress());
});

module.exports = router;
