let towerOperation={
    run:function(){
        for(let name in Game.rooms){
            let room=Game.rooms[name];
            let towers=room.find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_TOWER,my:true}});
            for(let tower of towers){
                let damaged_creep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: (creep) => {
                        return creep.hits < creep.hitsMax;
                    }
                });
                if(damaged_creep) {
                    tower.heal(damaged_creep);
                    continue;
                }
                let closest_hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{
                    filter:(creep)=>{
                        return (creep.getActiveBodyparts(ATTACK)>0||creep.getActiveBodyparts(RANGED_ATTACK)>0);
                    }
                });
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
            }
        }
    }
}

module.exports = towerOperation;