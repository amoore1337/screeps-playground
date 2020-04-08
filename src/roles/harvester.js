// Harvest energy and deliver to spawn in room.

const harvester = {
  run: (creep) => {
    if (creep.memory.targetRoom && creep.memory.targetRoom !== creep.room.name) {
      // find exit to target room
      const exit = creep.room.findExitTo(creep.memory.targetRoom);
      // move to exit
      creep.moveTo(creep.pos.findClosestByRange(exit));
    } else {
      if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.tripStartTime = Game.time;
        creep.memory.working = false;
        creep.say('🔄 harvest');
      }
      if (!creep.memory.working && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
        creep.memory.working = true;
        creep.say('delivering');
      }

      if (creep.memory.working) {
        // Try to store in extensions first:
        let targets = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => structure.structureType === STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity,
        });

        // If they're full, try the spawn:
        if (!targets.length) {
          targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_SPAWN && structure.energy < structure.energyCapacity,
          });
        }

        // If that's full too, put it in storage:
        if (!targets.length) {
          targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_STORAGE && structure.store.getFreeCapacity(),
          });
        }

        if (targets.length > 0) {
          if (targets[0].room.name !== creep.room.name) {
            console.log('idk what happened...', targets[0]);
            return;
          }
          const transferResult = creep.transfer(targets[0], RESOURCE_ENERGY);
          if (transferResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
          } else if (transferResult === OK) {
            const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
            if (spawn.memory.emergencyMode && spawn.isEnergyFull()) {
              spawn.memory.emergencyMode = false;
            }
            if (creep.memory.tripStartTime) {
              recordHarvestTripTime(spawn, Game.time - creep.memory.tripStartTime);
              creep.memory.tripStartTime = '';
            }
          }
        }
      } else {
        const tombstones = _.filter(creep.room.find(FIND_TOMBSTONES), (t) => t.store[RESOURCE_ENERGY]);
        const tombstone = tombstones.length && tombstones[0];

        if (tombstone) {
          if (creep.withdraw(tombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(tombstone, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
        } else {
          creep.fetchEnergy();
        }
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
