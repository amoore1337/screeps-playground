// Build any available construction sites in room.

const builder = {
  run: (creep) => {
    if (creep.memory.targetRoom && creep.memory.targetRoom !== creep.room.name) {
      // find exit to target room
      const exit = creep.room.findExitTo(creep.memory.targetRoom);
      // move to exit
      creep.moveTo(creep.pos.findClosestByRange(exit));
    } else {
      if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.building = false;
        creep.say('🔄 harvest');
      }
      if (!creep.memory.building && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
        creep.memory.building = true;
        creep.say('🚧 build');
      }

      if (creep.memory.building) {
        const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length) {
          if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
          }
        } else {
          creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
        }
      } else {
        creep.fetchEnergy();
      }
    }
  },
};

module.exports = builder;
