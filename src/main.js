const { printCreepStats } = require('helpers_utils');
const { respawnMissing } = require('helpers_creepManager');

const harvester = require('roles_harvester');
const upgrader = require('roles_upgrader');
const builder = require('roles_builder');

module.exports.loop = function() {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  printCreepStats();
  respawnMissing();

  move();
};

function move() {
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (creep.memory.role === 'harvester') {
      harvester.run(creep);
    } else if (creep.memory.role === 'upgrader') {
      upgrader.run(creep);
    } else if (creep.memory.role === 'builder') {
      builder.run(creep);
    }
  }
}
