// Harvest energy and deliver to spawn in room.

const harvester = {
  run: (creep) => {
    if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity() && !creep.memory.tripStartTime) {
      creep.memory.tripStartTime = Game.time;
    }

    if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity()) {
      const tombstones = _.filter(creep.room.find(FIND_TOMBSTONES), (t) => t.store[RESOURCE_ENERGY]);
      const tombstone = tombstones.length && tombstones[0];

      if (tombstone) {
        if (creep.withdraw(tombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(tombstone, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      } else {
        // Try to fill up from container if available:
        let targets = _.filter(creep.room.find(FIND_STRUCTURES), (s) => s.structureType === STRUCTURE_CONTAINER);
        targets = _.filter(targets, (s) => s.store[RESOURCE_ENERGY] > 0);

        // Look for a Storage structure:
        if (!targets.length) {
          targets = _.filter(
            creep.room.find(FIND_STRUCTURES),
            (s) => s.structureType === STRUCTURE_STORAGE && s.store.getFreeCapacity(),
          );
        }

        // Fall back to energy deposits:
        if (!targets.length) {
          targets = _.filter(creep.room.find(FIND_SOURCES), (s) => s.energy > 0);
        }

        const target = creep.pos.findClosestByPath(targets);
        if (target && target.energy && creep.harvest(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
        } else if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
    } else {
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            structure.structureType == STRUCTURE_STORAGE ||
            structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN
          ) && (
            (!structure.storage && structure.energy < structure.energyCapacity) ||
            (structure.storage && structure.storage.getFreeCapacity())
          );
        },
      });
      if (targets.length > 0) {
        const transferResult = creep.transfer(targets[0], RESOURCE_ENERGY);
        if (transferResult == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        } else if (creep.memory.tripStartTime) {
          recordHarvestTripTime(creep.room.find(FIND_MY_SPAWNS)[0], Game.time - creep.memory.tripStartTime);
          creep.memory.tripStartTime = '';
        }
      } else {
        creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
        creep.memory.state = 'inactive';
        creep.memory.tripStartTime = '';
      }
    }
  },
};

function recordHarvestTripTime(spawn, lastTripTime) {
  let previousTrips = Memory.harvestTripTracking && Memory.harvestTripTracking.previousTrips || [];
  if (previousTrips.length < 11) {
    previousTrips.push(lastTripTime);
  } else {
    previousTrips = previousTrips.slice(1, -1);
    previousTrips.push(lastTripTime);
  }

  const averageTripTime = Math.floor(previousTrips.reduce((a, b) => a + b, 0) / previousTrips.length);
  const energyPerTick = totalHarvesterEnergyCapacity(spawn.room) / averageTripTime;
  const fillEnergyTime = spawn.getTotalEnergyCapacity() / energyPerTick;

  spawn.memory.harvestTripTracking = { previousTrips, averageTripTime, energyPerTick, fillEnergyTime };
}

function totalHarvesterEnergyCapacity(room) {
  const harvesters = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role === 'harvester');
  const totalCapacity = _.reduce(harvesters, (sum, c) => sum + c.store.getCapacity(RESOURCE_ENERGY), 0);
  return totalCapacity;
}

module.exports = harvester;
