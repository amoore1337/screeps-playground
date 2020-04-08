const manager = {
  spawns: spawnNames,
  spawnBasicWorker: (role, mem, spawnIn) => {
    return spawn([WORK, CARRY, MOVE], role, mem, spawnIn);
  },
  spawnWorker: (role, mem, spawnIn) => {
    return spawn([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], role, mem, spawnIn);
  },
  spawnDynamicWorker: (role, mem, spawnIn) => {
    const maxEnergy = spawnIn.getTotalEnergyCapacity();
    if (maxEnergy <= 400) {
      return spawn([WORK, CARRY, MOVE], role, mem, spawnIn);
    } else if (maxEnergy > 400 && maxEnergy <= 550) {
      return spawn([WORK, CARRY, CARRY, MOVE, MOVE, MOVE], role, mem, spawnIn);
    } else {
      return spawn([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], role, mem, spawnIn);
    }
  },
  spawnHarvester: (mem, spawnIn) => {
    return spawn([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'harvester', mem, spawnIn);
  },
  spawnMiner: (mem, spawnIn) => {
    return spawn([WORK, WORK, WORK, WORK, WORK, MOVE], 'miner', mem, spawnIn);
  },
  spawnClaimer: (mem, spawnIn) => {
    return spawn([CLAIM, MOVE], 'claimer', mem, spawnIn);
  },
  spawnDefender: (mem, spawnIn) => {
    return spawn([
      TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, // 100
      MOVE, MOVE,
      WORK, // 100
      MOVE,
      ATTACK, ATTACK, // 160
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 450
    ], 'defender', mem, spawnIn);
  },
};

function creepName(role) {
  return 'creep_' + role + Game.time;
}

function spawn(body, role, mem, spawnIn) {
  let memory = { role };

  if (!spawnIn) {
    spawnIn = Game.spawns[spawnNames()[0]];
  }

  if (mem) {
    memory = _.merge(memory, mem);
  }

  const spawnResult = spawnIn.spawnCreep(body, creepName(role), { memory });
  if (spawnResult === OK) {
    console.log('[', spawnIn.name, '] Spawning ', role);
  }
  return spawnResult;
}

function spawnNames() {
  return _.keys(Game.spawns);
}

module.exports = manager;
