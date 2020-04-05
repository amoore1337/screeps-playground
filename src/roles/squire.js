// Tend to Towers in the room.

const squire = {
  run: (creep) => {
    if (creep.memory.refueling && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.refueling = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.refueling && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
      updateTarget(creep);
      creep.memory.refueling = true;
      creep.say('⚡ refueling defenses');
    }

    if (creep.memory.refueling) {
      const [target, type] = currentTarget(creep);
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
  updateTarget(creep);
  currentTargetId = creep.memory.target && creep.memory.target.id;
  const currentTarget = currentTargetId && Game.getObjectById(currentTargetId);
  return [currentTarget, currentTarget.structureType];
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
  // Prioritize tower refueling first:
  const towers = _.filter(
    room.find(FIND_STRUCTURES),
    (s) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY),
  );

  if (towers.length) {
    return _.sortBy(towers, (t) => t.sore.getFreeCapacity(RESOURCE_ENERGY))[0];
  }

  const walls = _.filter(
    room.find(FIND_STRUCTURES),
    (s) => s.structureType === STRUCTURE_WALL && s.hitsMax > s.hits,
  );

  if (walls.length) {
    return _.sortBy(walls, (w) => (w.hits / w.hitsMax))[0];
  }
}

module.exports = squire;
