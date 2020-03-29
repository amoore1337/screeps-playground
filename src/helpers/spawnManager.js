const manager = {
  spawns: spawnNames,
  spawnBasicWorker: (role, mem, spawnIn) => {
    spawn([WORK, CARRY, MOVE], role, mem, spawnIn);
  },
};

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
