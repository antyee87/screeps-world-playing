let roleCharger = {
    run: function(creep) {
        if(creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType==STRUCTURE_STORAGE||structure.structureType==STRUCTURE_SPAWN||structure.structureType==STRUCTURE_EXTENSION||structure.structureType==STRUCTURE_CONTAINER) &&
                        structure.store[RESOURCE_ENERGY] >=50;
                }
            });
            targets.sort((a,b)=>b.store[RESOURCE_ENERGY]-a.store[RESOURCE_ENERGY]);
            if(targets.length>0) {
                if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#00ffff'}});
                }
            }
            else{
                creep.moveTo(Game.spawns[creep.memory.return_spawn_name]);
            }
        }
        else {
            let target = Game.getObjectById(creep.memory.charge_tower);
            if(target) {
                if(creep.transfer(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};

module.exports = roleCharger
