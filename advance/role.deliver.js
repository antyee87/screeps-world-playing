let roleDeliver={
    run:function(creep){
        if(!creep.memory.deliver&&creep.store.getFreeCapacity() == 0){
            creep.memory.customer=null;
            creep.memory.time=0;
            creep.memory.deliver=true;
        }
        if(creep.memory.deliver&&creep.store.getUsedCapacity() == 0){
            creep.memory.deliver=false;
            creep.memory.destination=null;
        }
        
        if(creep.memory.deliver){
            creep.memory.time++;
            let destination=Game.getObjectById(creep.memory.destination);
            if(destination){
                for(const resourceType in creep.carry) {
                    if(destination.store.getFreeCapacity(resourceType)>0){
                        if(creep.transfer(destination, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(destination, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                        else{
                            break;
                        }
                    }
                    else{
                        creep.memory.destination=null;
                    }
                }
            }
            else{
                let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType==STRUCTURE_SPAWN||structure.structureType==STRUCTURE_EXTENSION) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if(target) {
                    creep.memory.destination=target.id;
                    return;
                }
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType==STRUCTURE_STORAGE||structure.structureType==STRUCTURE_CONTAINER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if(target) {
                    creep.memory.destination=target.id;
                    return;
                }
                creep.moveTo(new RoomPosition(3,17,'W7N7'));
            }
            if(creep.memory.time>10){
                let target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: (creep) => {
                        return creep.memory.role!='harvester'&&creep.store.getFreeCapacity()>0;
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
                let targets =_.filter(Game.creeps,(target)=>target.memory.role == 'harvester'&&target.memory.targeted<Memory.harvester_deliver_rate);
                targets.sort((a,b)=>b.store[RESOURCE_ENERGY]-a.store[RESOURCE_ENERGY]);
                if(targets.length>0){
                    targets[0].memory.targeted++;
                    creep.memory.customer=targets[0].id;
                    return;
                }
                else if(creep.store[RESOURCE_ENERGY]>0){
                    creep.memory.deliver=true;
                    return;
                }
                else{
                    creep.moveTo(new RoomPosition(3,17,'W7N7'));
                    return;
                }
            }
            else{
                let target = creep.pos.findClosestByRange(FIND_TOMBSTONES, {filter:(tombstone)=> {return tombstone.store[RESOURCE_ENERGY] >0;}});
                if(target) {
                    if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                    return;
                }
                
                target = creep.pos.findClosestByRange(FIND_RUINS, {filter:(ruin)=> {return ruin.store[RESOURCE_ENERGY] >0;}});
                if(target) {
                    if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                    return;
                }
    
                target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
                if(target) {
                    if(creep.pickup(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                    return;
                }            
                if(customer.store[RESOURCE_ENERGY]==0){
                    creep.memory.customer=null;
                }
                else{
                    creep.moveTo(customer, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
        
    }
};

module.exports =roleDeliver;