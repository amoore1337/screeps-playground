StructureTower.prototype.defend = function() {
  const enemies = tower.room.find(FIND_HOSTILE_CREEPS);
  if (enemies.length) {
    const target = tower.pos.findClosestByRange(enemies);
    tower.attack(target);
  }
};
