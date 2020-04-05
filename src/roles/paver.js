// Repair roads and containers in room.

const paver = {
  run: (creep) => {
    if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.repairing = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.repairing && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
      // Before returning to work, check what you should be targeting:
      currentOrNextTarget(creep);

      creep.memory.repairing = true;
      creep.say('🚧 pave');
    }

    if (creep.memory.repairing) {
      const target = currentOrNextTarget(creep);
      if (target) {
        if (creep.repair(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
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
    // Prioritize any containers with > 20% decay:
    const containers = _.filter(
      creep.room.find(FIND_STRUCTURES),
      (s) => s.structureType === STRUCTURE_CONTAINER && (s.hits / s.hitsMax) < .8,
    );

    if (containers.length) {
      return _.sortBy(containers, (r) => (r.hits / r.hitsMax));
    }

    const roads = _.filter(creep.room.find(FIND_STRUCTURES), (s) => s.structureType === STRUCTURE_ROAD && s.hitsMax > s.hits);
    return _.sortBy(roads, (r) => (r.hits / r.hitsMax));
  },
};

function currentOrNextTarget(creep) {
  const currentTarget = creep.getCurrentTarget();

  if (currentTarget && currentTarget.hits < currentTarget.hitsMax) {
    return currentTarget;
  }

  // If the current target doesn't repairing:
  return checkForTarget(creep);
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

module.exports = paver;
