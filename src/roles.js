const availableRoles = [
  'builder',
  'claimer',
  'defender',
  'harvester',
  'miner',
  'paver',
  'squire',
  'upgrader',
];

const roles = () => {
  const roleMap = {};
  availableRoles.forEach((role) => roleMap[role] = require(`roles_${role}`));
  return roleMap;
};

module.exports = {
  availableRoles,
  roles,
};
