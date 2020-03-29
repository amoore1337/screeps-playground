
const { creepCountMap } = require('./helpers_creepManager');
const { spawns } = require('./helpers_spawnManager');
const LOG_FREQ = 50;

const utils = {
  printCreepStats: () => {
    const lastLog = Memory.lastLog || 0;
    if (lastLog + LOG_FREQ <= Game.time) {
      Memory.lastLog = Game.time;

      spawns().forEach((spawnName) => {
        const spawn = Game.spawns[spawnName];
        const creepCounts = creepCountMap(spawn.room);

        console.log(`==== REPORT (${spawn.name}) ====`);
        for (const role in creepCounts) {
          console.log(role, ': ', creepCounts[role]);
        }
      });
    }
  },
};

module.exports = utils;
