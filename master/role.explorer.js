let roleExplorer={
    run:function(creep){
        if(creep.room.name != creep.memory.explore){
            creep.moveTo(new RoomPosition(25,25,creep.memory.explore),{visualizePathStyle: {stroke: '#ffffff'}});
        }
        if(creep.room.name == creep.memory.explore&&!creep.memory.arrive){
            if(creep.pos.findPathTo(new RoomPosition(25,25,creep.memory.explore)).length>22){
                creep.moveTo(new RoomPosition(25,25,creep.memory.explore),{visualizePathStyle: {stroke: '#ffffff'}});                
            }
            else{
                if(creep.memory.role)creep.memory.explore=null;
                else creep.memory.arrive=true;
            }
        }
        if(creep.room.name != creep.memory.explore){
            creep.memory.path_length++;
        }
    }
};
//Game.spawns['Spawn1'].spawnCreep([MOVE],'explorer'+Game.time,{memory: {role:'explorer',explore:'W8N7',working:true}});
module.exports = roleExplorer;