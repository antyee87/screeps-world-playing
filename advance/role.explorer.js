let roleExplorer={
    run:function(creep){
        if(creep.room.name != creep.memory.explore || !creep.memory.role){
            creep.moveTo(new RoomPosition(25,25,creep.memory.explore));
        }
        if(!creep.memory.role&& !creep.memory.path_length && creep.room.name == creep.memory.explore){
            let path_length=Game.spawns['Spawn1'].pos.findPathTo(creep,{ignoreCreeps:true,ignoreDestructibleStructures:true,ignoreRoads:true}).length;
            creep.memory.path_length=path_length;
        }
    }
};
//Game.spawns['Spawn1'].spawnCreep([MOVE],'explorer'+Game.time,{memory: {role:'explorer',explore:'W8N7',working:true}});
module.exports = roleExplorer;