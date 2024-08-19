let gameOperation={
    creep_respawn:function(){
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
        const kits=['upgrader','harvester','deliver','repairer','builder','killer','explorer'];
        const total_sources=gameOperation.source_distribute().total_sources;
        const limit={
            harvester:total_sources,
            builder:1,
            upgrader:2,
            repairer:3,
            deliver:total_sources*2
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
        //let default_body=[WORK,,WORK,CARRY,CARRY,MOVE,MOVE];
        let default_body=[WORK,CARRY,MOVE];
        //let harvester_body=[WORK,WORK,WORK,CARRY,MOVE,MOVE];
        let harvester_body=[WORK,WORK,CARRY,CARRY,MOVE];
        //let deliver_body=[CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
        let deliver_body=[CARRY,CARRY,MOVE,MOVE];
        let respawn=false;
        let line=0;
        for(let i=0;i<kits.length;i++){
            creeps[kits[i]] =_.filter(Game.creeps,(creep)=>creep.memory.role == kits[i]&&creep.ticksToLive>100);
            count[kits[i]]=creeps[kits[i]].length;
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
            let creep_body;
            switch(body_type[kits[i]]){
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
            if(count['deliver']<count['harvester']*2){
                count['harvester']=limit['harvester'];
            }
            if(count[kits[i]] < limit[kits[i]]) {
                let newName = kits[i] + Game.time;
                Game.spawns['Spawn1'].spawnCreep(creep_body,newName,
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
            if(invader_cores.length>0&&!Memory.creep_respawn){
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
        //,'1db807721502822','025e07727e00363'
        const available_sources=['33bd077274d064f','68a2077274dcb77','1db807721502822','c6ee0772d9884c3'];
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
        let harvesters= _.filter(Game.creeps,(creep)=>creep.memory.role=='harvester'&&creep.ticksToLive>100);
        for(let creep of harvesters){
            if(creep.memory.role=='harvester'&&creep.ticksToLive>100){
                sources_used[creep.memory.source]+=1;
            }
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
                            sources_weight+=1;
                        }
                    }
                }
                //if(sources_weight>3)sources_weight=3;
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