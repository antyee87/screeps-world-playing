let roleBuilder = {
    run: function(creep) {
        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
        }
        if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
        }
        if(creep.memory.building) {
            let targets=[];
            for(let name in Game.rooms){
                let sites=(Game.rooms[name].find(FIND_CONSTRUCTION_SITES));
                for(let i=0;i<sites.length;i++){
                    if(sites[i].structureType==STRUCTURE_TOWER)
                    {
                        targets.unshift(sites[i].id);
                    }
                    else{
                        targets.push(sites[i].id);
                    }
                }
            }
            if(targets.length) {
                let construction_site=Game.getObjectById(targets[0]);
                creep.memory.working = true;
                if(creep.build(construction_site) == ERR_NOT_IN_RANGE) {
                    
                    creep.moveTo(construction_site, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else{
                creep.memory.working =false;
            }
        }
        else {
            let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType==STRUCTURE_STORAGE||structure.structureType==STRUCTURE_SPAWN||structure.structureType==STRUCTURE_EXTENSION) &&
                        structure.store[RESOURCE_ENERGY] >=50;
                }
            });
            if(target&&!Memory.creep_respawn) {
                if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};

module.exports =roleBuilder;