let roomOccupied={
    run:function(){
        let occupied_rooms=['W8N7','W7N6','W6N7'];
        for(let i=0 ;i<occupied_rooms.length;i++){
            let has_explorer=false;
            for(let name in Game.creeps){
                if(Game.creeps[name].memory.explore==occupied_rooms[i]&&Game.creeps[name].ticksToLive>100){
                    has_explorer=true;
                    break;
                }
            }
            if(!has_explorer){
                Game.spawns['Spawn1'].spawnCreep([MOVE],'explorer'+Game.time,{memory: {explore:occupied_rooms[i],working:true}});
            }
        }
    }
}
module.exports = roomOccupied;