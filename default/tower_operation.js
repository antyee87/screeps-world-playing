var towerOperation={
    run:function(){
        var towers=['66c1b66cd2e34a894c2e160b'];
        for(var i=0;i<towers.length;i++){
            var tower = Game.getObjectById(towers[i]);
            if(tower) {
                var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(closestHostile) {
                    tower.attack(closestHostile);
                    continue;
                }
                var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax
                });
                if(closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                    continue;
                }
            }
        }
    }
}

module.exports = towerOperation;