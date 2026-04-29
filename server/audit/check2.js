// Check 2: Depot Having ND Code
function runCheck2(row) {
  const depotType = (row.depot_type || '').trim().toLowerCase();

  if (depotType !== 'depot') {
    return { check_number: 2, check_name: 'Depot Having ND Code', status: 'Passed', detail: null };
  }

  const costCode = (row.cost_code || '').toUpperCase();
  if (costCode.includes('ND')) {
    return {
      check_number: 2,
      check_name: 'Depot Having ND Code',
      status: 'Failed',
      detail: `Depot row found with ND cost code: ${row.cost_code}`,
    };
  }

  return { check_number: 2, check_name: 'Depot Having ND Code', status: 'Passed', detail: null };
}

module.exports = { runCheck2 };
