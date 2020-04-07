// Tend to defensive structures in the room.

const squire = {
  run: (creep) => {
    if (creep.memory.refueling && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.refueling = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.refueling && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
      // Before returning to work, check what you should be targeting:
      checkForTarget(creep, true);

      creep.memory.refueling = true;
      creep.say('⚡ refueling defenses');
    }

    if (creep.memory.refueling) {
      const [target, type] = currentOrNextTarget(creep);
      if (target) {
        if (type === STRUCTURE_TOWER && creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        } else if ([STRUCTURE_RAMPART, STRUCTURE_WALL].indexOf(type) > -1 && creep.repair(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
        creep.memory.state = 'inactive';
      }
    } else {
      creep.fetchEnergy();
    }
  },

  prioritizedTargets: (creep) => {
    let towers = _.filter(
      creep.room.find(FIND_STRUCTURES),
      (s) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY),
    );
    towers = _.sortBy(towers, (t) => t.store.getFreeCapacity(RESOURCE_ENERGY));

    let ramparts = _.filter(
      creep.room.find(FIND_STRUCTURES),
      (s) => s.structureType === STRUCTURE_RAMPART && s.hits < 250000,
    );
    ramparts = _.sortBy(ramparts, (r) => (r.hits / r.hitsMax));

    let walls = _.filter(
      creep.room.find(FIND_STRUCTURES),
      (s) => s.structureType === STRUCTURE_WALL && s.hitsMax > s.hits,
    );
    walls = _.sortBy(walls, (w) => (w.hits / w.hitsMax));

    return towers.concat(ramparts).concat(walls);
  },
};

function currentOrNextTarget(creep) {
  let currentTarget = creep.getCurrentTarget();

  if (currentTarget) {
    if (currentTarget.structureType === STRUCTURE_TOWER) {
      if (currentTarget.store.getFreeCapacity() > 0) {
        return [currentTarget, STRUCTURE_TOWER];
      }
    } else {
      if (currentTarget.hits < currentTarget.hitsMax) {
        return [currentTarget, currentTarget.structureType];
      }
    }
  }
  // If the current target doesn't need refueling, select the next:
  currentTarget = checkForTarget(creep);
  return [currentTarget, currentTarget ? currentTarget.structureType : ''];
}

// Determines when a new target should be selected:
function checkForTarget(creep, tripCompleted) {
  let target = creep.getCurrentTarget();

  // Build a padding in rampart health, don't stop repairing until over 20k hits:
  if (target && target.structureType === STRUCTURE_RAMPART && target.hits < 300000) {
    if (tripCompleted) {
      creep.memory.targetTripCount++;
    }
    return target;
  }

  // If you don't have a target, or you've already completed 2 trips to that target:
  if (!target || (creep.memory.targetTripCount && creep.memory.targetTripCount > 2)) {
    // Allow for swarming during war time:
    const warZone = creep.room.find(FIND_HOSTILE_CREEPS).length > 0;
    target = warZone ? creep.setNextTarget() : creep.setNextUniqueTarget();
    const tripCount = target ? 1 : 0;
    creep.memory.targetTripCount = tripCount;
    return target;
  }

  if (!creep.memory.targetTripCount) {
    creep.memory.targetTripCount = target ? 1 : 0;
  } else if (tripCompleted) {
    creep.memory.targetTripCount++;
  }

  return target;
}

module.exports = squire;
