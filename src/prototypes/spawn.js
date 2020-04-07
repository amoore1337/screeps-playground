StructureSpawn.prototype.getTotalEnergyCapacity = function() {
  const spawnCapacity = this.store.getCapacity(RESOURCE_ENERGY);
  const extensions = _.filter(this.room.find(FIND_MY_STRUCTURES), (s) => s.structureType === STRUCTURE_EXTENSION);
  const extensionCapacity = _.reduce(extensions, (sum, ex) => sum + ex.store.getCapacity(RESOURCE_ENERGY), 0);

  return spawnCapacity + extensionCapacity;
};

StructureSpawn.prototype.getCurrentEnergy = function() {
  const spawnEnergy = this.store[RESOURCE_ENERGY];
  const extensions = _.filter(this.room.find(FIND_MY_STRUCTURES), (s) => s.structureType === STRUCTURE_EXTENSION);
  const extensionsEnergy = _.reduce(extensions, (sum, ex) => sum + ex.store[RESOURCE_ENERGY], 0);

  return spawnEnergy + extensionsEnergy;
};

StructureSpawn.prototype.isEnergyFull = function() {
  return this.getTotalEnergyCapacity() === this.getCurrentEnergy();
};
