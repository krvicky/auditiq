// Check 1: Terminal Having FD Code
function runCheck1(row) {
  const depotType = (row.depot_type || '').trim().toLowerCase();

  if (depotType !== 'terminal') {
    return { check_number: 1, check_name: 'Terminal Having FD Code', status: 'Passed', detail: null };
  }

  const costCode = (row.cost_code || '').toUpperCase();
  if (costCode.includes('FD')) {
    return {
      check_number: 1,
      check_name: 'Terminal Having FD Code',
      status: 'Failed',
      detail: `Terminal row found with FD cost code: ${row.cost_code}`,
    };
  }

  return { check_number: 1, check_name: 'Terminal Having FD Code', status: 'Passed', detail: null };
}

module.exports = { runCheck1 };
