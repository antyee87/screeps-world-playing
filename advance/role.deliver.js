let roleDeliver={
    run:function(creep){
        if(!creep.memory.deliver&&creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
            creep.memory.customer=null;
            creep.memory.time=0;
            creep.memory.deliver=true;
        }
        if(creep.memory.deliver&&creep.store[RESOURCE_ENERGY] == 0){
            creep.memory.deliver=false;
        }
        
        if(creep.memory.deliver){
            creep.memory.time++;
            let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType==STRUCTURE_SPAWN||structure.structureType==STRUCTURE_EXTENSION) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else{
                if(creep.room.storage) {
                    if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                else if(creep.room!=Game.spawns['Spawn1'].room){
                    const exitDir=creep.room.findExitTo(Game.spawns['Spawn1'].room);
                    const exit = creep.pos.findClosestByRange(exitDir);
                    creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            if(creep.memory.time>10){
                let target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: (creep) => {
                        return creep.memory.role=='deliver'&&creep.store.getFreeCapacity()>0;
                    }
                });
                if(target) {
                    creep.transfer(target, RESOURCE_ENERGY);
                    creep.memory.time=0;
                }
            }
        }
        else{
            let customer=Game.getObjectById(creep.memory.customer);
            if(!customer){
                let target = creep.pos.findClosestByRange(FIND_TOMBSTONES, {filter:(tombstone)=> {return tombstone.store[RESOURCE_ENERGY] >0;}});
                if(target) {
                    if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                else{
                    target =creep.pos.findClosestByRange(FIND_MY_CREEPS,{
                        filter:(creep)=>{
                            return creep.memory.role=='harvester'&&creep.store[RESOURCE_ENERGY]/creep.store.getCapacity(RESOURCE_ENERGY)>=0.5&&creep.memory.targeted<3;
                        }
                    });
                    if(target){
                        target.memory.targeted+=1;
                        creep.memory.customer=target.id;
                        return;
                    }
                    else{
                        let targets =_.filter(Game.creeps,(target)=>target.memory.role == 'harvester'&&target.room!=creep.room&&target.memory.targeted<3);
                        if(targets.length>0){
                            targets[0].memory.targeted+=1;
                            creep.memory.customer=targets[0].id;
                            return;
                        }
                        else if(creep.store[RESOURCE_ENERGY]>0){
                            creep.memory.deliver=true;
                            return;
                        }
                        else{
                            creep.moveTo(new RoomPosition(5,16,'W7N7'));
                            return;
                        }
                    }
                }
            }
            else{
                creep.moveTo(customer, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            
        }
        
    }
};

module.exports =roleDeliver;