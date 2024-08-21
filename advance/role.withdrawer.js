let roleWithdrawer={
    run:function(creep){
        if(!creep.memory.deliver&&creep.store.getFreeCapacity(RESOURCE_ENERGY)==0){
            creep.memory.deliver=true;
        }
        if(creep.memory.deliver&&creep.store[RESOURCE_ENERGY]==0){
            creep.memory.deliver=false;
        }
        if(creep.memory.deliver){
            let target = creep.pos.findClosestByRange(FIND_STRUCTURES,(structure)=>{
                return (structure.structureType==STRUCTURE_SPAWN||structure.structureType==STRUCTURE_EXTENSION)&&structure.store.getFreeCapacity()>0;
            })
            if(targets.length>0){
                if(creep.transfer(target,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                    creep.moveTo(target,{visualizePathStyle: {stroke: '#00ffff'}});
                }
            }
        }
        else{
            let storage=Game.spawns['Spawn1'].room.storage;
            if(storage){
                if(creep.withdraw(storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                    creep.moveTo(storage,{visualizePathStyle: {stroke: '#00ffff'}});
                }
            }
        }
    }
};
module.exports = roleWithdrawer;