
var roleRepairer = {
    run: function(creep) {
        if(creep.store.getFreeCapacity() > 0){
            if(creep.harvest(Game.getObjectById(creep.memory['source'])) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory['source']),{visualizePathStyle:{stroke:'#ffaa00'}});
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType==STRUCTURE_TOWER) &&
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

module.exports = roleRepairer;
