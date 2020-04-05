const { spawns, spawnWorker, spawnBasicWorker, spawnHarvester, spawnMiner } = require('./helpers_spawnManager');

const CREEP_REQS = {
  harvester: 3,
  upgrader: 3,
  builder: 2,
  paver: 2,
  squire: 2,
};

const manager = {
  creepCountMap: creepCountMap,
  respawnMissing: () => {
    spawns().forEach((spawnName) => {
      const spawn = Game.spawns[spawnName];

      if (spawn.isSpawning) {
        return;
      }

      // FAILSAFE for not enough energy
      if (creepCountMap(spawn.room)['harvester'] === 0) {
        spawnBasicWorker('harvester', {}, spawn);
        return;
      }

      if (missingMiners(spawn.room)) {
        spawnMiner({}, spawn);
      }

      for (let i = 0; i < _.keys(CREEP_REQS).length; i++) {
        const role = _.keys(CREEP_REQS)[i];
        if (role === 'builder' && buildQueue(spawn.room).length < 1) {
          continue;
        }

        if (creepCountMap(spawn.room)[role] < CREEP_REQS[role]) {
          if (role === 'harvester') {
            spawnHarvester({}, spawn);
          } else {
            spawnWorker(role, {}, spawn);
          }
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
  };
}

function creepCounter(room, role) {
  if (role) {
    return _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role === role).length;
  } else {
    return _.size(room.find(FIND_MY_CREEPS)).length;
  }
}

module.exports = manager;
