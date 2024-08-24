var roleBalancer={
    run:function(creep){
        if(creep.memory.delivering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.delivering = false;
        }
        if(!creep.memory.delivering && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.delivering = true;
        }
        if(creep.memory.delivering){
            let storage=Game.getObjectById(creep.memory.destination);
                if(creep.transfer(storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                    creep.moveTo(storage,{visualizePathStyle: {stroke: '#ffffff'}});
                }
        }
        else{
            if(creep.memory.source){
                let storage=Game.getObjectById(creep.memory.source);
                if(creep.withdraw(storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                    creep.moveTo(storage,{visualizePathStyle: {stroke: '#00ffff'}});
                }
            }
            else{
                let storages=[];
                for(let name in Game.rooms){
                    let room=Game.rooms[name];
                    if(room.storage)storages.push(room.storage.id);
                }
                storages.sort((a,b)=>{
                    Game.getObjectById(a).store[RESOURCE_ENERGY]-Game.getObjectById(b).store[RESOURCE_ENERGY];
                });
                creep.memory.source=storages[storages.length-1];
                creep.memory.destination=storages[0];
            }
        }
    }
};
module.exports = roleBalancer;