let roleHarvester = {
    run: function(creep) {
        let source=Game.getObjectById(creep.memory['source']);
        if(source&&(!source.room.controller||!source.room.controller.reservation)){
            if(creep.store.getFreeCapacity(RESOURCE_ENERGY)>0&&source.energy>0){
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source,{visualizePathStyle:{stroke:'#ffffff'}});
                }
            }
        }
        else{
            creep.memory.source=null;
            creep.moveTo(Game.spawns[creep.memory.return_spawn_name]);
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