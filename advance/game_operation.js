let gameOperation={
    creep_respawn:function(){
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
        const kits=['upgrader','harvester','deliver','repairer','builder','killer'];
        const total_sources=gameOperation.source_distribute().total_sources;
        Memory.harvester_deliver_rate=3;
        const limit={
            harvester:total_sources,
            builder:4,
            upgrader:2,
            repairer:2,
            deliver:total_sources*Memory.harvester_deliver_rate
        }
        const body_type={
            harvester:'harvester_body',
            builder:'default_body',
            upgrader:'default_body',
            repairer:'default_body',
            deliver:'deliver_body'
        }
        let creeps={};
        let count={};
        let default_body=[WORK,WORK,WORK,CARRY,MOVE,MOVE];
        let harvester_body=[WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE];
        let deliver_body=[CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];

        let line=0;
        for(let kit of kits){
            if(kit=='harvester'){
                creeps[kit] =_.filter(Game.creeps,(creep)=>creep.memory.role==kit&&creep.ticksToLive>creep.memory.path_length*1.4);
            }
            else{
                creeps[kit] =_.filter(Game.creeps,(creep)=>creep.memory.role==kit&&creep.ticksToLive>50);
            }
            count[kit]=creeps[kit].length;
            if(count[kit]>0||limit[kit]>0){
                if(limit[kit]>0){
                    Game.spawns['Spawn1'].room.visual.text(
                        kit+":" + count[kit]+'/'+limit[kit],
                        Game.spawns['Spawn1'].pos.x,
                        Game.spawns['Spawn1'].pos.y+line+5,
                        {align: 'center', opacity: 0.8}
                    );
                }                
                else{
                    Game.spawns['Spawn1'].room.visual.text(
                        kit+":" + count[kit],
                        Game.spawns['Spawn1'].pos.x,
                        Game.spawns['Spawn1'].pos.y+line+5,
                        {align: 'center', opacity: 0.8}
                    );
                }
                line++;
            }
        }
        if(count['deliver']*Memory.harvester_deliver_rate<count['harvester']){
            count['harvester']=limit['harvester'];
        }
        let respawn=false;
        for(let kit of kits){
            let creep_body;
            switch(body_type[kit]){
                case 'harvester_body':
                    creep_body=harvester_body;
                    break;
                case 'default_body':
                    creep_body=default_body;
                    break;
                case 'deliver_body':
                    creep_body=deliver_body;
                    break;
            }
            if(respawn)continue;
            if(count[kit] < limit[kit]) {
                let newName = kit + Game.time;
                Game.spawns['Spawn1'].spawnCreep(creep_body,newName,
                    {memory: {role:kit,working:true}});
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
        for(let name in Game.rooms){
            let room=Game.rooms[name];
            let hostile_creeps = room.find(FIND_HOSTILE_CREEPS,{filter:(creep)=>{
                return (creep.getActiveBodyparts(ATTACK)>0||creep.getActiveBodyparts(RANGED_ATTACK)>0);
                }
            });
            if(hostile_creeps.length>0){
                has_invader=true;
                break;
            }
        }    
        if(has_invader&&count['killer']<1) {
            Game.spawns['Spawn1'].spawnCreep([MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK],'killer'+Game.time,{memory: {role:'killer',working:true}});
        }
        return respawn;
    },
    source_distribute:function(){
        const available_sources=['33bd077274d064f','68a2077274dcb77','1db807721502822','c6ee0772d9884c3','025e07727e00363','6bfc07721507fca','1dd2077197120a2'];
        let available_rooms=[];
        let sources = [];
        let sources_used={};
        let total_sources=0;
        for(let i=0;i<available_sources.length;i++){
            sources_used[available_sources[i]]=0;
            source=Game.getObjectById(available_sources[i]);
            if(source){
                if(!source.room.id in available_rooms){
                    available_rooms.push(source.room.id);
                }
            }
        }
        let harvesters= _.filter(Game.creeps,(creep)=>creep.memory.role=='harvester'&&creep.ticksToLive>creep.memory.path_length*1.4);
        for(let creep of harvesters){
            sources_used[creep.memory.source]++;
        }
        for(let i=0;i<available_sources.length;i++){
            let source=Game.getObjectById(available_sources[i]);
            if(source){
                let posX=source.pos.x;
                let posY=source.pos.y;
                let sources_weight=0;
                const terrain = new Room.Terrain(source.room.name);
                for(let x=-1;x<=1;x++){
                    for(let y=-1;y<=1;y++){
                        if(terrain.get(posX+x,posY+y)!=1){
                            sources_weight++;
                        }
                    }
                }
                if(sources_weight>3)sources_weight=3;
                total_sources+=sources_weight;
                sources_weight-=sources_used[available_sources[i]];
                for(let j=0;j<sources_weight;j++){
                    sources.push(available_sources[i]);
                }
            }
        }
        
        const return_object={
            total_sources:total_sources,
            sources:sources,
        };
        return return_object;
    }
};
module.exports = gameOperation;