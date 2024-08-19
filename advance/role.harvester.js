let roleHarvester = {
    run: function(creep) {
        if(creep.store.getFreeCapacity()>0&&Game.getObjectById(creep.memory['source']).energy>0){
            if(creep.harvest(Game.getObjectById(creep.memory['source'])) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory['source']),{visualizePathStyle:{stroke:'#ffaa00'}});
            }
            creep.memory.time=0;
        }
        creep.memory.time++;
        let target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (creep) => {
                return creep.memory.role=='deliver'&&creep.store.getFreeCapacity()>0;
            }
        });
        if(target) {
            creep.transfer(target, RESOURCE_ENERGY);
        }
        if(creep.memory.time>10){
            target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: (creep) => {
                    return (creep.memory.role=='deliver'||creep.memory.role=='harvester')&&creep.store.getFreeCapacity()>0;
                }
            });
            if(target) {
                creep.transfer(target, RESOURCE_ENERGY);
                creep.memory.time=0;
            }
        }
    }
};

module.exports = roleHarvester;