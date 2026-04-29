// Check 3: Positive Value in DC Code
function runCheck3(row) {
  const costCode = (row.cost_code || '').toUpperCase();

  if (!costCode.endsWith('DC')) {
    return { check_number: 3, check_name: 'Positive in DC Code', status: 'Passed', detail: null };
  }

  const value = Math.abs(parseFloat(row.manual_value) || 0);
  if (value > 0) {
    return {
      check_number: 3,
      check_name: 'Positive in DC Code',
      status: 'Failed',
      detail: `DC cost code ${row.cost_code} has positive manual value: ${value}`,
    };
  }

  return { check_number: 3, check_name: 'Positive in DC Code', status: 'Passed', detail: null };
}

module.exports = { runCheck3 };
