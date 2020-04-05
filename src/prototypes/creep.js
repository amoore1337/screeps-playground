const roles = {
  builder: require('roles_builder'),
  harvester: require('roles_harvester'),
  miner: require('roles_miner'),
  paver: require('roles_paver'),
  squire: require('roles_squire'),
  upgrader: require('roles_upgrader'),
};

Creep.prototype.runRole = function() {
  roles[this.memory.role].run(this);
};

Creep.prototype.getCurrentTarget = function() {
  const currentTargets = Memory[`${this.memory.role}Targets`] || {};
  if (currentTargets[this.name]) {
    return Game.getObjectById(currentTargets[this.name]);
  }
};

Creep.prototype.updateTargets = function(newTarget) {
  const targets = Memory[`${this.memory.role}Targets`] || {};

  delete targets[this.name];

  if (newTarget) {
    targets[this.name] = newTarget.id;
  }

  Memory[`${this.memory.role}Targets`] = targets;
};

Creep.prototype.findFirstUniqueTarget = function() {
  const currentTargetIds = _.values(Memory[`${this.memory.role}Targets`] || {});
  for (const target of roles[this.memory.role].prioritizedTargets(this)) {
    if (currentTargetIds.indexOf(target.id) < 0) {
      return target;
    }
  }
};

Creep.prototype.setNextUniqueTarget = function() {
  const newTarget = this.findFirstUniqueTarget();
  this.updateTargets(newTarget);
  return newTarget;
};
