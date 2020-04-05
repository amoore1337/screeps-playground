const manager = {
  spawns: spawnNames,
  totalEnergyCapacity: totalEnergyCapacity,
  spawnBasicWorker: (role, mem, spawnIn) => {
    spawn([WORK, CARRY, MOVE], role, mem, spawnIn);
  },
  spawnWorker: (role, mem, spawnIn) => {
    spawn([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], role, mem, spawnIn);
  },
  spawnHarvester: (mem, spawnIn) => {
    spawn([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'harvester', mem, spawnIn);
  },
};

function totalEnergyCapacity(spawn) {
  const spawnCapacity = spawn.store.getCapacity(RESOURCE_ENERGY);
  const extensions = _.filter(spawn.room.find(FIND_MY_STRUCTURES), (s) => s.structureType === STRUCTURE_EXTENSION);
  const extensionCapacity = _.reduce(extensions, (sum, ex) => sum + ex.store.getCapacity(RESOURCE_ENERGY), 0);

  return spawnCapacity + extensionCapacity;
}

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

  if (spawnIn.spawnCreep(body, creepName(role), { memory }) === OK) {
    console.log('Spawning ', role);
  }
}

function spawnNames() {
  return _.keys(Game.spawns);
}

module.exports = manager;
