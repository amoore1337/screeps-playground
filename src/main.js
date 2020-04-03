const { printCreepStats } = require('helpers_utils');
const { respawnMissing } = require('helpers_creepManager');

const harvester = require('roles_harvester');
const upgrader = require('roles_upgrader');
const builder = require('roles_builder');
const squire = require('roles_squire');
const paver = require('roles_paver');


const tower = require('roles_tower');

module.exports.loop = function() {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  printCreepStats();
  respawnMissing();

  moveTowers();
  moveCreeps();
};

function moveTowers() {
  const towers = _.filter(Game.structures, (s) => s.sourceType === STRUCTURE_TOWER);
  for (const t in towers) {
    tower.run(t);
  }
}

function moveCreeps() {
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (creep.memory.role === 'harvester') {
      harvester.run(creep);
    } else if (creep.memory.role === 'upgrader') {
      upgrader.run(creep);
    } else if (creep.memory.role === 'builder') {
      builder.run(creep);
    } else if (creep.memory.role === 'paver') {
      paver.run(creep);
    } else if (creep.memory.role === 'squire') {
      squire.run(creep);
    }
  }
}
