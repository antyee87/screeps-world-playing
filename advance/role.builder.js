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
                let sites=( Game.rooms[name].find(FIND_CONSTRUCTION_SITES));
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
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType==STRUCTURE_STORAGE||structure.structureType==STRUCTURE_SPAWN||structure.structureType==STRUCTURE_EXTENSION) &&
                        structure.store[RESOURCE_ENERGY] >=50;
                }
            });
            targets.sort((a,b)=>b.store[RESOURCE_ENERGY]-a.store[RESOURCE_ENERGY]);
            if(targets.length>0&&(!Memory.creep_respawn||(creep.room.storage&&creep.room.storage.store[RESOURCE_ENERGY]>0))) {
                if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else{
                creep.moveTo(new RoomPosition(3,17,'W7N7'));
            }
        }
    }
};

module.exports =roleBuilder;