const { spawns, spawnDynamicWorker, spawnBasicWorker, spawnMiner, spawnClaimer } = require('./helpers_spawnManager');
const { availableRoles } = require('roles');

const manager = {
  creepCountMap: creepCountMap,
  respawnMissing: () => {
    spawns().forEach((spawnName) => {
      const spawn = Game.spawns[spawnName];

      if (spawn.room.find(FIND_MY_CREEPS) === 0) {
        spawn.memory.emergencyMode = true;
      }

      if (spawn.isSpawning) {
        return;
      }

      // FAILSAFE for not enough energy
      if (creepCountMap(spawn.room)['harvester'] < 1) {
        spawnBasicWorker('harvester', { targetRoom: spawn.room.name }, spawn);
        return;
      }

      if (missingMiners(spawn.room)) {
        spawnMiner({ targetRoom: spawn.room.name }, spawn);
        return;
      }


      const creepRequests = creepReq(spawn);
      for (let i = 0; i < _.keys(creepRequests).length; i++) {
        const role = _.keys(creepRequests)[i];
        if (creepCountMap(spawn.room)[role] < creepRequests[role]) {
          const spawnMethod = spawn.memory.emergencyMode ? spawnBasicWorker : spawnDynamicWorker;
          spawnMethod(role, { targetRoom: spawn.room.name }, spawn);
          return;
        }
      }

      if (spawn.memory.claimRoom) {
        if (spawnClaimer({ target: spawn.memory.claimRoom }, spawn) === OK) {
          delete spawn.memory.claimRoom;
          return;
        }
      }

      if (spawn.memory.supportingNewColony) {
        const newRoom = Game.rooms[spawn.memory.supportingNewColony];
        if (newRoom.find(FIND_MY_SPAWNS).length) {
          delete spawn.memory.supportingNewColony;
          return;
        }
        const newColReqs = creepNewColReq();
        for (let i = 0; i < _.keys(newColReqs).length; i++) {
          const role = _.keys(newColReqs)[i];
          const creepsInRoom = creepCountMap(newRoom)[role];
          if (creepsInRoom < newColReqs[role]) {
            // This could be an expensive operation so nest it so its rarely called:
            const creepsTravelingToRoom = _.filter(Game.creeps, (creep) => {
              return creep && creep.memory.targetRoom === newRoom.name;
            });
            if (creepsTravelingToRoom + creepsInRoom < newColReqs[role]) {
              spawnBasicWorker(role, { targetRoom: newRoom.name }, spawn);
              return;
            }
          }
        }
      }
    });
  },
};

function missingMiners(room) {
  const containers = _.filter(room.find(FIND_STRUCTURES), (s) => s.structureType === STRUCTURE_CONTAINER);
  return containers.length > creepCountMap(room).miner;
}

function creepCountMap(room) {
  const countMap ={};
  availableRoles.forEach((role) => countMap[role] = creepCounter(room, role));
  return countMap;
}

function creepCounter(room, role) {
  if (role) {
    return _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role === role).length;
  } else {
    return _.size(room.find(FIND_MY_CREEPS)).length;
  }
}

function creepReq(spawn) {
  const needBuilder = spawn.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0;
  const needsPaver = _.filter(
    spawn.room.find(FIND_STRUCTURES),
    (s) => [STRUCTURE_ROAD, STRUCTURE_CONTAINER].indexOf(s.structureType) > 0,
  ).length > 0;

  const needsSquire = _.filter(
    spawn.room.find(FIND_STRUCTURES),
    (s) => [STRUCTURE_WALL, STRUCTURE_TOWER, STRUCTURE_RAMPART].indexOf(s.structureType) > -1 && s.hits,
  ).length > 0;

  if (spawn.memory.emergencyMode) {
    return {
      harvester: 3,
      paver: needsPaver ? 1 : 0,
      upgrader: 1,
      squire: needsSquire ? 1: 0,
      builder: needBuilder ? 1 : 0,
    };
  }

  const maxEnergy = spawn.getTotalEnergyCapacity();
  if (maxEnergy <= 300) {
    return {
      harvester: 2,
      upgrader: needsPaver && needBuilder ? 1 : 2,
      squire: needsSquire ? 1 : 0,
      paver: needsPaver ? 1 : 0,
      builder: needBuilder ? 2 : 0,
    };
  } else if (maxEnergy <= 550) {
    return {
      harvester: 3,
      upgrader: needsPaver && needBuilder ? 2 : 3,
      squire: needsSquire ? 2 : 0,
      paver: needsPaver ? 1 : 0,
      builder: needBuilder ? 2 : 0,
    };
  } else {
    return {
      harvester: 3,
      upgrader: needsPaver && needBuilder ? 2 : 3,
      paver: needsPaver ? 1 : 0,
      builder: needBuilder ? 2 : 0,
      squire: needsSquire ? 5 : 0,
    };
  }
}

function creepNewColReq() {
  return {
    builder: 2,
    upgrader: 1,
  };
}

module.exports = manager;
