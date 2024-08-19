let roleRepairer = {
    run: function(creep) {
        if(creep.store.getFreeCapacity() > 0){
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
        }
        else {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType==STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) >0;
                }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};

module.exports = roleRepairer;
