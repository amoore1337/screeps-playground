// Tend to defensive structures in the room.

const squire = {
  run: (creep) => {
    if (creep.memory.refueling && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.refueling = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.refueling && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
      // Before returning to work, check what you should be targeting:
      checkForTarget(creep);

      creep.memory.refueling = true;
      creep.say('⚡ refueling defenses');
    }

    if (creep.memory.refueling) {
      const [target, type] = currentOrNextTarget(creep);

      if (target) {
        if (type === STRUCTURE_TOWER && creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        } else if (type === STRUCTURE_WALL && creep.repair(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
        creep.memory.state = 'inactive';
      }
    } else {
      let targets = _.filter(creep.room.find(FIND_STRUCTURES), (s) => s.structureType === STRUCTURE_CONTAINER);
      targets = _.filter(targets, (s) => s.store[RESOURCE_ENERGY] > 0);
      const target = creep.pos.findClosestByPath(targets);
      if (target && target.energy && creep.harvest(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
      } else if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  },

  prioritizedTargets: (creep) => {
    const towers = _.filter(
      creep.room.find(FIND_STRUCTURES),
      (s) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY),
    );

    if (towers.length) {
      return _.sortBy(towers, (t) => t.sore.getFreeCapacity(RESOURCE_ENERGY));
    }

    const walls = _.filter(
      creep.room.find(FIND_STRUCTURES),
      (s) => s.structureType === STRUCTURE_WALL && s.hitsMax > s.hits,
    );

    return _.sortBy(walls, (w) => (w.hits / w.hitsMax));
  },
};

function currentOrNextTarget(creep) {
  let currentTarget = creep.getCurrentTarget();

  if (currentTarget) {
    if (currentTarget.structureType === STRUCTURE_TOWER) {
      if (currentTarget.store.getFreeCapacity() > 0) {
        return [currentTarget, STRUCTURE_TOWER];
      }
    } else if (currentTarget.structureType === STRUCTURE_WALL) {
      if (currentTarget.hits < currentTarget.hitsMax) {
        return [currentTarget, STRUCTURE_WALL];
      }
    }
  }
  // If the current target doesn't need refueling, select the next:
  currentTarget = checkForTarget(creep);
  return [currentTarget, currentTarget ? currentTarget.structureType : ''];
}

// Determines when a new target should be selected:
function checkForTarget(creep) {
  let target = creep.getCurrentTarget();

  // If you don't have a target, or you've already completed 2 trips to that target:
  if (!target || (creep.memory.targetTripCount && creep.memory.targetTripCount > 2)) {
    target = creep.setNextUniqueTarget();
    creep.memory.targetTripCount = target ? 1 : 0;
    return target;
  }

  if (!creep.memory.targetTripCount) {
    creep.memory.targetTripCount = target ? 1 : 0;
  } else {
    creep.memory.targetTripCount++;
  }

  return target;
}

module.exports = squire;
