let towerOperation={
    run:function(){
        let towers=['66c1b66cd2e34a894c2e160b','66c43544018b87894bff3615'];
        for(let i=0;i<towers.length;i++){
            let tower = Game.getObjectById(towers[i]);
            if(tower) {
                let closest_hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(closest_hostile) {
                    tower.attack(closest_hostile);
                    continue;
                }
                let damaged_structures = tower.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.hits < structure.hitsMax&&structure.hits<300000;
                    }
                });
                
                if(damaged_structures.length>0) {
                    let structures_hits=[];
                    for(let i=0;i<damaged_structures.length;i++){
                        structures_hits.push({id:damaged_structures[i].id,hits:damaged_structures[i].hits});
                    }   
                    structures_hits.sort((a, b) => a.hits - b.hits);
                    tower.repair(Game.getObjectById(structures_hits[0].id));
                    continue;
                }
                
                let damaged_creep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: (creep) => {
                        return creep.hits < creep.hitsMax;
                    }
                });
                if(damaged_creep) {
                    tower.heal(damaged_creep);
                    continue;
                }
            }
        }
    }
}

module.exports = towerOperation;