// Calc Method = 'A' codes — auto-calculated, no manual value expected.
const AUTO_COST_CODES = new Set([
  'CGCUFL', 'CGCUMT',
  'SRFDFL', 'SRFDMT', 'SRNDFL', 'SRNDMT', 'SRNDTS',
  'SVALFL', 'SVALMT', 'SVALTS',
  'SVLDFL', 'SVLDMT', 'SVLDTM', 'SVLDTS',
  'SVSSFL', 'SVSSMT', 'SVSSTM', 'SVSSTS',
  'TMFDFL', 'TMFDMT',
  'TMNDFL', 'TMNDMT', 'TMNDRF', 'TMNDRM', 'TMNDTS',
  'TPNDFL', 'TPNDMT', 'TPNDTM', 'TPNDTS',
]);

module.exports = { AUTO_COST_CODES };
