// Upgrade controller in room.

const upgrader = {
  run: (creep) => {
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
    }

    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    } else {
      let targets = _.filter(creep.room.find(FIND_STRUCTURES), (s) => s.structureType === STRUCTURE_CONTAINER);
      targets = _.filter(targets, (s) => s.store[RESOURCE_ENERGY] > 0);
      if (!targets.length) {
        targets = creep.room.find(FIND_SOURCES);
      }
      const target = creep.pos.findClosestByPath(targets);
      if (target && target.energy && creep.harvest(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
      } else if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  },
};

module.exports = upgrader;
