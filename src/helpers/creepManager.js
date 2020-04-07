const { spawns, spawnDynamicWorker, spawnBasicWorker, spawnMiner } = require('./helpers_spawnManager');

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
        spawnBasicWorker('harvester', {}, spawn);
        return;
      }

      if (missingMiners(spawn.room)) {
        spawnMiner({}, spawn);
        return;
      }


      const creepRequests = creepReq(spawn);
      for (let i = 0; i < _.keys(creepRequests).length; i++) {
        const role = _.keys(creepRequests)[i];

        if (creepCountMap(spawn.room)[role] < creepRequests[role]) {
          const spawnMethod = spawn.memory.emergencyMode ? spawnBasicWorker : spawnDynamicWorker;
          spawnMethod(role, {}, spawn);
          break;
        }
      }
    });
  },
};

function buildQueue(room) {
  return room.find(FIND_MY_CONSTRUCTION_SITES);
}

function missingMiners(room) {
  const containers = _.filter(room.find(FIND_STRUCTURES), (s) => s.structureType === STRUCTURE_CONTAINER);
  return containers.length > creepCountMap(room).miner;
}

function creepCountMap(room) {
  return {
    harvester: creepCounter(room, 'harvester'),
    upgrader: creepCounter(room, 'upgrader'),
    builder: creepCounter(room, 'builder'),
    squire: creepCounter(room, 'squire'),
    paver: creepCounter(room, 'paver'),
    miner: creepCounter(room, 'miner'),
    defender: creepCounter(room, 'defender'),
  };
}

function creepCounter(room, role) {
  if (role) {
    return _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role === role).length;
  } else {
    return _.size(room.find(FIND_MY_CREEPS)).length;
  }
}

function creepReq(spawn) {
  const needBuilder = buildQueue(spawn.room).length > 0;
  const needsPaver = _.filter(spawn.room.find(FIND_STRUCTURES, (s) => [STRUCTURE_ROAD, STRUCTURE_CONTAINER].indexOf(s.structureType)));
  const needsSquire = _.filter(spawn.room.find(FIND_STRUCTURES, (s) => [STRUCTURE_WALL, STRUCTURE_TOWER, STRUCTURE_RAMPART].indexOf(s.structureType)));
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
      harvester: 3,
      upgrader: needsPaver && needBuilder ? 1 : 2,
      squire: needsSquire ? 1 : 0,
      paver: needsPaver ? 1 : 0,
      builder: needBuilder ? 1 : 0,
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

module.exports = manager;
