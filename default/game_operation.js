var gameOperation={
    creep_respawn:function(){
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
        var kits=['upgrader','harvester','builder','collector','charger','killer','explorer'];
        var limit={
            harvester:10,
            builder:1,
            upgrader:1,
            collector:0,
            charger:2
        }
        var creeps={};
        var count={};
        var creep_body=[WORK,CARRY,MOVE];
        var respawn=false;
        let line=0;
        for(var i=0;i<kits.length;i++){
            creeps[kits[i]] =_.filter(Game.creeps,(creep)=>creep.memory.role == kits[i]);
            count[kits[i]]=creeps[kits[i]].length
            if(count[kits[i]]>0||limit[kits[i]]>0){
                if(limit[kits[i]]>0){
                    Game.spawns['Spawn1'].room.visual.text(
                        kits[i]+":" + count[kits[i]]+'/'+limit[kits[i]],
                        Game.spawns['Spawn1'].pos.x,
                        Game.spawns['Spawn1'].pos.y+line+4,
                        {align: 'center', opacity: 0.8}
                    );
                }                
                else{
                    Game.spawns['Spawn1'].room.visual.text(
                        kits[i]+":" + count[kits[i]],
                        Game.spawns['Spawn1'].pos.x,
                        Game.spawns['Spawn1'].pos.y+line+4,
                        {align: 'center', opacity: 0.8}
                    );
                }
                line++;
            }
            if(respawn)continue;
            if(count[kits[i]] < limit[kits[i]]) {
                var newName = kits[i] + Game.time;
                Game.spawns['Spawn1'].spawnCreep(creep_body, newName,
                    {memory: {role:kits[i],working:true}});
                respawn=true;
            }
        }
        
        let has_invader=false;
        for(let name in Game.rooms){
            let room=Game.rooms[name];
            let invader_cores = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_INVADER_CORE)
                }
            })
            if(invader_cores.length>0){
                has_invader=true;
                break;
            }
        }
        if(has_invader&&count['killer']<1) {
            Game.spawns['Spawn1'].spawnCreep([MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK],'killer'+Game.time,{memory: {role:'killer',working:true}});
        }
    },
    source_distribute:function(){
        //,'1db807721502822','025e07727e00363','c6ee0772d9884c3'
        var available_sources=['33bd077274d064f','68a2077274dcb77'];
        var sources = [];
        var sources_weight={}
        for(var i=0;i<available_sources.length;i++){
            let source=Game.getObjectById(available_sources[i]);
            if(source){
                 var posX=source.pos.x;
                var posY=source.pos.y;
                const terrain = new Room.Terrain(source.room.name);
                sources_weight[available_sources[i]]=0;
                for(var x=-1;x<=1;x++){
                    for(var y=-1;y<=1;y++){
                        if(terrain.get(posX+x,posY+y)!=1){
                            sources_weight[available_sources[i]]+=1;
                        }
                    }
                }
                for(var j=0;j<sources_weight[available_sources[i]];j++){
                    sources.push(available_sources[i]);
                }
            }
        }
        return sources;
    }
};
module.exports = gameOperation;