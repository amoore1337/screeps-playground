const manager = {
  spawns: spawnNames,
  totalEnergyCapacity: totalEnergyCapacity,
  spawnBasicWorker: (role, mem, spawnIn) => {
    spawn([WORK, CARRY, MOVE], role, mem, spawnIn);
  },
  spawnHarvester: (mem, spawnIn) => {
    spawn([WORK, CARRY, CARRY, MOVE, MOVE], 'harvester', mem, spawnIn);
  },
};

function totalEnergyCapacity(spawn) {
  const spawnCapacity = spawn.store.getCapacity(RESOURCE_ENERGY);
  const extensions = _.filter(spawn.room.find(FIND_MY_STRUCTURES), (s) => s.structureType === STRUCTURE_EXTENSION);
  const extensionCapacity = _.reduce(extensions, (sum, ex) => sum + ex.store.getCapacity(RESOURCE_ENERGY), 0);

  return spawnCapacity + extensionCapacity;
}

function creepName(role) {
  return 'creep_' + role.split('')[0] + Game.time;
}

function spawn(body, role, mem, spawnIn) {
  let memory = { role };

  if (!spawnIn) {
    spawnIn = Game.spawns[spawnNames()[0]];
  }

  if (mem) {
    memory = _.merge(memory, mem);
  }

  return spawnIn.spawnCreep(body, creepName(role), { memory });
}

function spawnNames() {
  return _.keys(Game.spawns);
}

module.exports = manager;
