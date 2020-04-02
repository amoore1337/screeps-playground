// Upgrade controller in room.

const upgrader = {
  run: (creep) => {
    if (creep.memory.refueling && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.refueling = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.refueling && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
      creep.memory.refueling = true;
      creep.say('⚡ refueling towers');
    }

    if (creep.memory.refueling) {
      const towers = _.filter(
        creep.room.find(FIND_STRUCTURES),
        (s) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY),
      );
      const target = towers.length && towers[0];
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
        creep.memory.state = 'inactive';
      }
    } else {
      const sources = creep.room.find(FIND_SOURCES);
      const target = creep.pos.findClosestByPath(sources);
      if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  },
};

module.exports = upgrader;
