let roleHarvester = {
    run: function(creep) {
        let source=Game.getObjectById(creep.memory['source']);
        if(source){
            if(creep.store.getFreeCapacity(RESOURCE_ENERGY)>0&&source.energy>0){
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.memory.path_length++;
                    creep.moveTo(source,{visualizePathStyle:{stroke:'#ffaa00'}});
                }
            }
        }
        else{
            creep.memory.source=null;
        }
        let target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (creep) => {
                return creep.memory.role=='courier'&&creep.store.getFreeCapacity()>0;
            }
        });
        if(target) {
            creep.transfer(target, RESOURCE_ENERGY);
        }
    }
};

module.exports = roleHarvester;