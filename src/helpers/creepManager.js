const { spawns, spawnBasicWorker } = require('./helpers_spawnManager');

const CREEP_REQS = {
  harvester: 2,
  upgrader: 2,
  builder: 2,
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

      for (let i = 0; i < _.keys(CREEP_REQS).length; i++) {
        const role = _.keys(CREEP_REQS)[i];
        if (role === 'builder' && buildQueue(spawn.room).length < 1) {
          continue;
        }

        if (creepCountMap(spawn.room)[role] < CREEP_REQS[role]) {
          spawnBasicWorker(role, {}, spawn);
          break;
        }
      }
    });
  },
};

function buildQueue(room) {
  return room.find(FIND_MY_CONSTRUCTION_SITES);
}

function creepCountMap(room) {
  return {
    harvester: creepCounter(room, 'harvester'),
    upgrader: creepCounter(room, 'upgrader'),
    builder: creepCounter(room, 'builder'),
  };
}

function creepCounter(room, role) {
  if (role) {
    return _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role === role).length;
  } else {
    return _.size(room.find(FIND_MY_CREEPS));
  }
}

module.exports = manager;
