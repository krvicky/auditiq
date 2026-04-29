const express = require('express');
const { buildClient } = require('../audit/check4');

const router = express.Router();

router.get('/ai-provider', (req, res) => {
  const info = buildClient();
  if (!info) {
    return res.json({ provider: 'none', model: null, configured: false });
  }
  res.json({ provider: info.provider, model: info.model, configured: true });
});

module.exports = router;
