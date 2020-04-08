const defender = {
  run: (creep) => {
    if (creep.memory.targetRoom && creep.memory.targetRoom !== creep.room.name) {
      // find exit to target room
      const exit = creep.room.findExitTo(creep.memory.targetRoom);
      // move to exit
      creep.moveTo(creep.pos.findClosestByRange(exit));
    } else {
      if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.working = false;
        creep.say('🔄 harvest');
      }
      if (!creep.memory.working && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
        creep.memory.working = true;
        creep.say('🚧 pave');
      }

      if (creep.memory.working) {
        const enemies = creep.room.find(FIND_HOSTILE_CREEPS);
        const target = creep.pos.findClosestByRange(enemies);
        if (target) {
          if (attack(creep, target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
          }
        } else {
          creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
        }
      } else {
        creep.fetchEnergy();
      }
      const enemies = creep.room.find(FIND_HOSTILE_CREEPS);
      if (enemies.length) {
        const target = creep.pos.findClosestByRange(enemies);
        creep.attack(target);
      }
    }
  },
};

// Try to melee first, if available. If that doesn't work, try ranged.
function attack(creep, target) {
  const canMelee = _.some(creep.body, { type: ATTACK });
  const hasRanged = _.some(creep.body, { type: RANGED_ATTACK });
  let result;
  if (canMelee) {
    result = creep.attack(target);
  }
  if (result !== OK && hasRanged) {
    return creep.rangedAttack(target);
  }
  return result;
}

module.exports = defender;
