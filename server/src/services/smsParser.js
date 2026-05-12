function parseSmsRequest(body) {
  const parts = body.trim().toUpperCase().split(/\s+/);
  if (parts[0] !== 'BLOOD') return null;

  const bloodTypeMap = {
    'O+': 'O_POS', 'O-': 'O_NEG',
    'A+': 'A_POS', 'A-': 'A_NEG',
    'B+': 'B_POS', 'B-': 'B_NEG',
    'AB+': 'AB_POS', 'AB-': 'AB_NEG',
  };

  return {
    bloodType: bloodTypeMap[parts[1]],
    units: parseInt(parts[2]) || 1,
    urgency: ['CRITICAL','URGENT','SCHEDULED'].includes(parts[3]) ? parts[3] : 'URGENT',
    pincode: parts[4] || null,
  };
}

module.exports = { parseSmsRequest };
