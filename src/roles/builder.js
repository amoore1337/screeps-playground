// Build any available construction sites in room.

const builder = {
  run: (creep) => {
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

module.exports = builder;
