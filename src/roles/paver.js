// Repair roads in room.

const paver = {
  run: (creep) => {
    if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.repairing = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.repairing && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
      updateTarget(creep);
      creep.memory.repairing = true;
      creep.say('🚧 pave');
    }

    if (creep.memory.repairing) {
      const target = currentTarget(creep);
      if (target) {
        if (creep.repair(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
      }
    } else {
      const sources = creep.room.find(FIND_SOURCES);
      const target = creep.pos.findClosestByPath(sources);
      if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  },
};

function currentTarget(creep) {
  let currentTargetId = creep.memory.target && creep.memory.target.id;

  if (currentTargetId) {
    const currentTarget = Game.getObjectById(currentTargetId);
    if (currentTarget.hits < currentTarget.hitsMax) {
      return currentTarget;
    }
  }

  // If the current target doesn't need repair, select the next:
  updateTarget(creep);
  currentTargetId = creep.memory.target && creep.memory.target.id;
  return currentTargetId && Game.getObjectById(currentTargetId);
}

function updateTarget(creep) {
  if (!creep.memory.target || !creep.memory.target.id || creep.memory.target.tripCount > 2) {
    const nextTarget = findNextTarget(creep.room);
    creep.memory.target = nextTarget ? {
      tripCount: 1,
      id: nextTarget.id,
    } : null;
  } else {
    creep.memory.target.tripCount++;
  }
}

function findNextTarget(room) {
  const roads = _.filter(room.find(FIND_STRUCTURES), (s) => s.structureType === STRUCTURE_ROAD && s.hitsMax > s.hits);
  const targets = _.sortBy(roads, (r) => (r.hitsMax / r.hits));
  return targets.length && targets[0];
}

module.exports = paver;
