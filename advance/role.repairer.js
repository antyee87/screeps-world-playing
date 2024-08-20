let roleRepairer = {
    run: function(creep) {
        if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
        }
        if(!creep.memory.repairing && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.repairing = true;
        }
        if(creep.memory.repairing){
            for(let name in Game.rooms){
                let room=Game.rooms[name];
                if(room.controller.my){
                    let targets = room.find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_TOWER}});
                    if(targets.length==0){
                        targets = room.find(FIND_STRUCTURES,{
                            filter:(structure)=>{
                                return structure.structureType==STRUCTURE_CONTAINER&&structure.hits<structure.hitsMax;
                            }
                        });
                        if(creep.repair(targets[0])==ERR_NOT_IN_RANGE){
                            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                    else{
                        creep.moveTo(new RoomPosition(3,17,'W7N7'));
                    }
                    
                }
            }
            
        }
        else{
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType==STRUCTURE_STORAGE||structure.structureType==STRUCTURE_SPAWN||structure.structureType==STRUCTURE_EXTENSION) &&
                        structure.store[RESOURCE_ENERGY] >=50;
                }
            });
            targets.sort((a,b)=>b.store[RESOURCE_ENERGY]-a.store[RESOURCE_ENERGY]);
            if(targets.length>0) {
                if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else{
                creep.moveTo(new RoomPosition(23,8,'W7N7'));
            }
        }
    }
};

module.exports = roleRepairer;