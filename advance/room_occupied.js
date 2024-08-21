let roomOccupied={
    run:function(){
        let occupied_rooms=['W7N6','W6N7','W9N7','W8N6','W9N8','W9N6','W8N5'];
        let has_explorer={};
        for(let name of occupied_rooms){
            has_explorer[name]=false;
        }
        for(let name in Game.creeps){
            let creep=Game.creeps[name];
            if(creep.memory.explore&&!creep.memory.role){
                if(creep.memory.path_length){
                    if(creep.ticksToLive>creep.memory.path_length*1.7){
                        has_explorer[Game.creeps[name].memory.explore]=true;
                    }
                }
                else{
                    has_explorer[Game.creeps[name].memory.explore]=true;
                }
            }
        }
        for(let name of occupied_rooms){
            if(!has_explorer[name]){
                Game.spawns['Spawn1'].spawnCreep([MOVE],'explorer'+Game.time,{memory: {explore:name,working:true}});
            }
        }
    }
}
module.exports = roomOccupied;