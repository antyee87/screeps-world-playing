var roleCollector = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.store.getFreeCapacity() > 0){
            var tomb_stones=creep.room.find(FIND_TOMBSTONES);
            if(tomb_stones.length>0){
                if(creep.withdraw(tomb_stones[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(tomb_stones[0],{visualizePathStyle:{stroke:'#ffaa00'}});
                }
            }
            else{
                creep.memory.working=false;
            }
        }
        else {
            var targets = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType==STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(targets.length > 0) {
                creep.memory.working = true;
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else{
                creep.memory.working=false;
            }
        }
    }
};

module.exports = roleCollector;