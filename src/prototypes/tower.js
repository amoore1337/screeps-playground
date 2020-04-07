StructureTower.prototype.defend = function() {
  const enemies = this.room.find(FIND_HOSTILE_CREEPS);
  if (enemies.length) {
    const target = this.pos.findClosestByRange(enemies);
    this.attack(target);
  }
};
