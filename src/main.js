const { printCreepStats, cleanupDeceasedCreeps } = require('helpers_utils');
const { respawnMissing } = require('helpers_creepManager');

require('prototypes_creep');
require('prototypes_tower');
require('prototypes_spawn');


module.exports.loop = function() {
  cleanupDeceasedCreeps();

  printCreepStats();
  respawnMissing();

  moveTowers();
  moveCreeps();
};

function moveTowers() {
  const towers = _.filter(Game.structures, (s) => s.structureType == STRUCTURE_TOWER);
  for (const tower of towers) {
    tower.defend();
  }
}

function moveCreeps() {
  for (const name in Game.creeps) {
    Game.creeps[name].runRole();
  }
}
