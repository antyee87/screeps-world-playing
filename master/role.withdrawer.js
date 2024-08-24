let roleWithdrawer={
    run:function(creep){
        if(!creep.memory.delivering&&creep.store.getFreeCapacity(RESOURCE_ENERGY)==0){
            creep.memory.delivering=true;
        }
        if(creep.memory.delivering&&creep.store[RESOURCE_ENERGY]==0){
            creep.memory.delivering=false;
        }
        if(creep.memory.delivering){
            let target = creep.pos.findClosestByRange(FIND_STRUCTURES,{filter:(structure)=>{
                return (structure.structureType==STRUCTURE_SPAWN||structure.structureType==STRUCTURE_EXTENSION)&&structure.store.getFreeCapacity(RESOURCE_ENERGY)>0;
            }});
            if(target){
                if(creep.transfer(target,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                    creep.moveTo(target,{visualizePathStyle: {stroke: '#00ffff'}});
                }
            }
            else{
                creep.moveTo(Game.spawns[creep.memory.return_spawn_name]);
            }
        }
        else{
            let storages=[];
            for(let name in Game.rooms){
                let room = Game.rooms[name];
                let storage=room.storage;
                if(storage){
                    storages.push(storage);
                }
            }
            storages.sort((a,b)=>b.store[RESOURCE_ENERGY]-a.store[RESOURCE_ENERGY]);
            if(creep.withdraw(storages[0],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                creep.moveTo(storages[0],{visualizePathStyle: {stroke: '#00ffff'}});
            }
        }
    }
};
module.exports = roleWithdrawer;