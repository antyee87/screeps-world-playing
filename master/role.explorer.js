let roleExplorer={
    run:function(creep){
        if(creep.room.name != creep.memory.explore){
            creep.moveTo(new RoomPosition(25,25,creep.memory.explore),{visualizePathStyle: {stroke: '#ffffff'}});
        }
        if(creep.room.name == creep.memory.explore){
            if(creep.pos.findPathTo(new RoomPosition(25,25,creep.memory.explore)).length>23){
                creep.moveTo(new RoomPosition(25,25,creep.memory.explore),{visualizePathStyle: {stroke: '#ffffff'}});                
            }
            else{
                creep.memory.arrived=true;
            }
        }
        if(creep.room.name != creep.memory.explore){
            creep.memory.path_length++;
        }
    }
};
//Game.spawns['Spawn1'].spawnCreep([MOVE],'explorer'+Game.time,{memory: {role:'explorer',explore:'W8N7',working:true}});
module.exports = roleExplorer;