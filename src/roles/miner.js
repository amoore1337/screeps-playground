const miner = {
  run: (creep) => {
    if (creep.memory.targetRoom && creep.memory.targetRoom !== creep.room.name) {
      // find exit to target room
      const exit = creep.room.findExitTo(creep.memory.targetRoom);
      // move to exit
      creep.moveTo(creep.pos.findClosestByRange(exit));
    } else {
      let target = creep.getCurrentTarget();
      if (!target) {
        target = creep.setNextUniqueTarget();
      }

      if (target && creep.pos.isEqualTo(target.pos)) {
        const source = creep.pos.findInRange(FIND_SOURCES, 1)[0];
        creep.harvest(source);
      } else {
        creep.moveTo(target);
      }
    }
  },
  prioritizedTargets: (creep) => {
    const containers = _.filter(creep.room.find(FIND_STRUCTURES), (s) => s.structureType === STRUCTURE_CONTAINER);
    return _.sortBy(containers, (c) => creep.pos.getRangeTo(c));
  },
};

module.exports = miner;
