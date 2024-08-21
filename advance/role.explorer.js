let roleExplorer={
    run:function(creep){
        if(creep.room.name != creep.memory.explore || !creep.memory.role){
            creep.moveTo(new RoomPosition(25,25,creep.memory.explore));
        }
        if(creep.room.name == creep.memory.explore && creep.memory.role){
            creep.moveTo(new RoomPosition(25,25,creep.memory.explore));
            if(creep.pos.findPathTo(new RoomPosition(25,25,creep.memory.explore)).length<24){
                creep.memory.explore=null;
            }
        }
        
        if(creep.room.name != creep.memory.explore){
            creep.memory.path_length++;
        }
    }
};
//Game.spawns['Spawn1'].spawnCreep([MOVE],'explorer'+Game.time,{memory: {role:'explorer',explore:'W8N7',working:true}});
module.exports = roleExplorer;