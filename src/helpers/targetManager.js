const targetManager = {
  updateTarget(role, previousTargetId, currentTargetId) {
    let targets = Memory[`${role}Targets`] || [];

    if (previousTargetId) {
      targets = _.filter(targets, (t) => t !== previousTargetId);
    }

    if (currentTargetId) {
      targets.unshift(currentTargetId);
    }

    Memory[`${role}Targets`] = _.uniq(targets);
  },
};

module.exports = targetManager;
