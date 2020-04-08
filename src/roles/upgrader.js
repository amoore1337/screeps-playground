// Upgrade controller in room.

const upgrader = {
  run: (creep) => {
    if (creep.memory.targetRoom && creep.memory.targetRoom !== creep.room.name) {
      // find exit to target room
      const exit = creep.room.findExitTo(creep.memory.targetRoom);
      // move to exit
      creep.moveTo(creep.pos.findClosestByRange(exit));
    } else {
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
        creep.fetchEnergy();
      }
    }
  },
};

module.exports = upgrader;
