const roles = require('roles').roles();

Creep.prototype.runRole = function() {
  roles[this.memory.role].run(this);
};

Creep.prototype.fetchEnergy = function() {
  // Try to fill up from container if available:
  let targets = _.filter(this.room.find(FIND_STRUCTURES), (s) => s.structureType === STRUCTURE_CONTAINER);
  targets = _.filter(targets, (s) => s.store[RESOURCE_ENERGY] > 0);

  // Look for a Storage structure:
  if (!targets.length) {
    targets = _.filter(
      this.room.find(FIND_STRUCTURES),
      (s) => s.structureType === STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY],
    );
  }

  // Fall back to energy deposits:
  const canHarvest = _.some(this.body, { type: WORK });
  if (!targets.length && canHarvest) {
    targets = _.filter(this.room.find(FIND_SOURCES), (s) => s.energy > 0);
  }

  const target = this.pos.findClosestByPath(targets);
  if (target && !target.store && this.harvest(target) === ERR_NOT_IN_RANGE) {
    this.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
  } else if (target && this.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    this.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
  } else {
    this.moveTo(this.room.find(FIND_MY_SPAWNS)[0]);
  }
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
  this.updateTargets();
  const newTarget = this.findFirstUniqueTarget();
  this.updateTargets(newTarget);
  return newTarget;
};

Creep.prototype.setNextTarget = function() {
  const targets = roles[this.memory.role].prioritizedTargets(this);
  const target = targets.length ? targets[0] : null;
  this.updateTargets(target);
  return target;
};
