const COMPATIBLE_DONORS = {
  'A_POS':  ['A_POS', 'A_NEG', 'O_POS', 'O_NEG'],
  'A_NEG':  ['A_NEG', 'O_NEG'],
  'B_POS':  ['B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
  'B_NEG':  ['B_NEG', 'O_NEG'],
  'AB_POS': ['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG'],
  'AB_NEG': ['A_NEG','B_NEG','AB_NEG','O_NEG'],
  'O_POS':  ['O_POS', 'O_NEG'],
  'O_NEG':  ['O_NEG'],
};

function getCompatibleDonorTypes(recipientBloodType) {
  return COMPATIBLE_DONORS[recipientBloodType] || [];
}

module.exports = { getCompatibleDonorTypes };
