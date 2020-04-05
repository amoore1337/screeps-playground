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
  findFirstUnique(role, targets) {
    if (!targets && targets.length) {
      return null;
    }
    return targets[0];
    const currentTargets = Memory[`${role}Targets`];
    for (let i = 0; i < targets.length; i++) {
      if (currentTargets.indexOf(targets[i].id) < 0) {
        return targets[i];
      }
    }
  },
};

module.exports = targetManager;
