let gameOperation={
    creep_respawn:function(){
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
        const kits=['upgrader','harvester','courier','charger','builder','killer','cleaner','repairer'];
        const total_sources=gameOperation.source_distribute().total_sources;
        Memory.harvester_courier_rate=3;
        const limit={
            harvester:total_sources,
            builder:3,
            upgrader:4,
            charger:2,
            repairer:1,
            courier:total_sources*Memory.harvester_courier_rate
        }
        gameOperation.room_distribute(limit['upgrader']);
        const body_type={
            harvester:'harvester_body',
            builder:'builder_body',
            upgrader:'default_body',
            charger:'default_body',
            repairer:'default_body',
            courier:'courier_body'
        }
        const body_content={
            default_body:[WORK,WORK,WORK,CARRY,MOVE,MOVE],
            builder_body:[WORK,WORK,CARRY,CARRY,MOVE,MOVE],
            harvester_body:[WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE],
            courier_body:[CARRY,CARRY,MOVE,MOVE]
        }
        let creeps={};
        let count={};
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
        if(count['courier']<count['harvester']*Memory.harvester_courier_rate){
            count['harvester']=limit['harvester'];
        }
        let respawn=false;
        for(let kit of kits){
            let creep_body=body_content[body_type[kit]];
            if(respawn)continue;
            if(count[kit] < limit[kit]) {
                let newName = kit + Game.time;
                Game.spawns['Spawn1'].spawnCreep(creep_body,newName,
                    {memory: {role:kit,working:true}});
                respawn=true;
            }
        }
        let invader_cores_count=0,hostile_creeps_count=0;
        for(let name in Game.rooms){
            let room=Game.rooms[name];
            let invader_cores = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_INVADER_CORE)
                }
            });
            let hostile_creeps = room.find(FIND_HOSTILE_CREEPS,{filter:(creep)=>{
                return (creep.getActiveBodyparts(ATTACK)>0||creep.getActiveBodyparts(RANGED_ATTACK)>0);
                }
            });
            
            invader_cores_count+=invader_cores.length;
            hostile_creeps_count+=hostile_creeps.length;
        }
        if(invader_cores_count>count['cleaner']) {
            Game.spawns['Spawn1'].spawnCreep([MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK],'killer'+Game.time,{memory: {role:'killer',working:true}});
        }
        else if(hostile_creeps_count>count['killer']) {
            Game.spawns['Spawn1'].spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,HEAL],'killer'+Game.time,{memory: {role:'killer',working:true}});
        }
        return respawn;
    },
    source_distribute:function(){
        const available_sources=['33bd077274d064f','68a2077274dcb77','1db807721502822','c6ee0772d9884c3','025e07727e00363','6bfc07721507fca','1dd2077197120a2'];
        let available_rooms=[];
        let sources = [];
        let sources_used={};
        let total_sources=0;
        for(let id of available_sources){
            sources_used[id]=0;
            source=Game.getObjectById(id);
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
        for(let id of available_sources){
            let source=Game.getObjectById(id);
            if(source){
                let posX=source.pos.x;
                let posY=source.pos.y;
                let sources_weight=0;
                for(let x=-1;x<=1;x++){
                    for(let y=-1;y<=1;y++){
                        const look = source.room.lookAt(new RoomPosition(source.pos.x+x,source.pos.y+y,source.room.name));
                        for(let object of look){
                            if(object.type=='terrain'){
                                if(object.terrain!='wall'){
                                    sources_weight++;
                                    break;
                                }
                            }
                            if(object.type=='structure'){
                                let has_road=false;
                                for(let i in object.structure){
                                    if(object.structure[i]=='road'){
                                        sources_weight++;
                                        has_road=true;
                                        break;
                                    }
                                }
                                if(has_road)break;
                            }
                        }
                    }
                }
                if(sources_weight>3)sources_weight=3;
                total_sources+=sources_weight;
                sources_weight-=sources_used[id];
                for(let j=0;j<sources_weight;j++){
                    sources.push(id);
                }
            }
        }
        const return_object={
            total_sources:total_sources,
            sources:sources,
        };
        return return_object;
    },
    room_distribute:function(upgrader_limit){
        let my_controllers=[];
        let controller_upgrader_count={};
        for(let name in Game.rooms){
            let room = Game.rooms[name];
            if(room.controller.my){
                my_controllers.push(room.controller.id);
                controller_upgrader_count[room.controller.id]=0;
            }
        }
        let upgrader=_.filter(Game.creeps,(creep)=>creep.memory.role=='upgrader');
        for(let creep of upgrader){
            if(creep.memory.upgrade_controller){
                controller_upgrader_count[creep.memory.upgrade_controller]++;
            }
        }
        for(let creep of upgrader){
            if(!creep.memory.upgrade_controller){
                for(let controller of my_controllers){
                    if(controller_upgrader_count[controller]<upgrader_limit/my_controllers.length){
                        creep.memory.upgrade_controller=controller;
                        controller_upgrader_count[controller]++;
                    }
                }
            }
        }
    }
};
module.exports = gameOperation;