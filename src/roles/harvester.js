
const harvester = {
  run: (creep) => {
    if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity() && !creep.memory.tripStartTime) {
      creep.memory.tripStartTime = Game.time;
    }

    if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity()) {
      const sources = _.filter(creep.room.find(FIND_SOURCES), (s) => s.energy > 0);
      if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    } else {
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN
          ) && structure.energy < structure.energyCapacity;
        },
      });
      if (targets.length > 0) {
        const transferResult = creep.transfer(targets[0], RESOURCE_ENERGY);
        if (transferResult == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        } else if (creep.memory.tripStartTime) {
          recordHarvestTripTime(Game.time - creep.memory.tripStartTime);
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

function recordHarvestTripTime(lastTripTime) {
  let previousTrips = Memory.harvestTripTracking && Memory.harvestTripTracking.previousTrips || [];
  if (previousTrips.length < 5) {
    previousTrips.push(lastTripTime);
  } else {
    previousTrips = previousTrips.slice(1, -1);
    previousTrips.push(lastTripTime);
  }

  const averageTripTime = Math.floor(previousTrips.reduce((a, b) => a + b, 0) / previousTrips.length);

  Memory.harvestTripTracking = { previousTrips, averageTripTime };
}

module.exports = harvester;
