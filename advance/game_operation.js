let gameOperation={
    creep_respawn:function(){
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
        let no_tower_rooms_count=0;
        for(let name in Game.rooms){
            let room = Game.rooms[name];
            if(room.controller.my){
                let towers=room.find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_TOWER}});
                if(towers.length==0)no_tower_rooms_count++;
            }
        }
        const kits=['upgrader','harvester','courier','charger','builder','killer','cleaner','repairer','withdrawer'];
        if(Game.time%20==0){
            source_distribute_result=gameOperation.source_distribute();
            Memory.total_sources = source_distribute_result.total_sources;
            Memory.sources=source_distribute_result.sources;
        }
        const total_sources = Memory.total_sources;
        for(let name in Game.creeps){
            let creep=Game.creeps[name];
            let source=Game.getObjectById(creep.memory.source);
            if(!source && creep.memory.role=='harvester'){
                if(Memory.sources.length>0){
                    creep.memory.source=Memory.sources.shift();
                }
            }
        }
        
        Memory.harvester_courier_rate=3;
        const limit={
            harvester:total_sources,
            builder:0,
            upgrader:4,
            charger:3,
            repairer:no_tower_rooms_count,
            courier:total_sources*Memory.harvester_courier_rate
        }
        let init_creeps=_.filter(Game.creeps,(creep)=>{
            return creep.memory.role=='upgrader'&&!Game.getObjectById(creep.memory.upgrade_controller);
        });
        if(init_creeps.length>0)gameOperation.controller_distribute();
        init_creeps=_.filter(Game.creeps,(creep)=>{
            return creep.memory.role=='charger'&&!Game.getObjectById(creep.memory.charge_tower);
        });
        if(init_creeps.length>0)gameOperation.tower_distribute();
        const body_type={
            harvester:'harvester',
            builder:'builder',
            upgrader:'default',
            charger:'default',
            repairer:'default',
            courier:'courier'
        }
        const body_content={
            default:[WORK,WORK,CARRY,CARRY,MOVE,MOVE],
            builder:[WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
            harvester:[WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE],
            courier:[CARRY,CARRY,CARRY,MOVE,MOVE,MOVE]
        }
        let creeps={};
        let count={};
        let line=0;
        for(let kit of kits){
            creeps[kit] =_.filter(Game.creeps,(creep)=>creep.memory.role==kit&&(!creep.ticksToLive||creep.ticksToLive>50));
            count[kit]=creeps[kit].length;
            if(count[kit]>0||limit[kit]>0){
                for(let name in Game.spawns){
                    let spawn=Game.spawns[name];
                    if(limit[kit]>0){
                        spawn.room.visual.text(
                            kit+":" + count[kit]+'/'+limit[kit],
                            spawn.pos.x,
                            spawn.pos.y+line+5,
                            {align: 'center', opacity: 0.8}
                        );
                    }                
                    else{
                        spawn.room.visual.text(
                            kit+":" + count[kit],
                            spawn.pos.x,
                            spawn.pos.y+line+5,
                            {align: 'center', opacity: 0.8}
                        );
                    }
                }
                line++;
            }
        }
        if(count['courier']<count['harvester']*Memory.harvester_courier_rate){
            count['harvester']=limit['harvester'];
        }
        let respawn=false;
        if(count['deliver']==0&&count['withdrawer']<2){
            Game.spawns['Spawn1'].spawnCreep(body_content['courier'],newName,{memory: {role:'withdrawer',working:true}});
        }
        for(let kit of kits){
            if(respawn)continue;
            let creep_body=body_content[body_type[kit]];
            for(let name in Game.spawns){
                let spawn=Game.spawns[name];
                if(spawn.spawning)continue;
                if(count[kit] < limit[kit]) {
                    let newName = kit + Game.time;
                    respawn=true;
                    count[kit]++;
                    spawn.spawnCreep(creep_body,newName,{memory: {role:kit,working:true}});
                }
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
        if(invader_cores_count*2>count['cleaner']) {
            Game.spawns['Spawn1'].spawnCreep([MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK],'killer'+Game.time,{memory: {role:'cleaner',working:true}});
        }
        else if(hostile_creeps_count*2>count['killer']) {
            Game.spawns['Spawn1'].spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,HEAL],'killer'+Game.time,{memory: {role:'killer',working:true}});
        }
        return respawn;
    },
    source_distribute:function(){
        let available_sources=[];
        for(let name in Game.rooms){
            let room=Game.rooms[name];
            let sources=room.find(FIND_SOURCES);
            sources.forEach(obj=>{available_sources.push(obj.id)})
        }
        for(let source_id of available_sources){
            let source=Game.getObjectById(source_id);
            if(!Memory.source_distance)Memory.source_distance={};
            if(source&&!Memory.source_distance[source_id]){
                Memory.source_distance[source_id]=Game.spawns['Spawn1'].pos.findPathTo(Game.getObjectById(source_id)).length;
            }
        }
        available_sources.sort((a,b)=>Memory.source_distance[a]-Memory.source_distance[b]);
        let sources = [];
        let sources_used={};
        let total_sources=0;
        let harvesters= _.filter(Game.creeps,(creep)=>creep.memory.role=='harvester'&&creep.ticksToLive>50);
        for(let id of available_sources){
            sources_used[id]=0;
        }
        for(let creep of harvesters){
            let source=Game.getObjectById(creep.memory.source);
            if(source)sources_used[source.id]++;
            else creep.memory.source=null;
        }
        for(let id of available_sources){
            let source=Game.getObjectById(id);
            if(source){
                if(source.room.controller.reservation>0)continue;
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
                if(sources_weight>2)sources_weight=2;
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
    controller_distribute:function(){
        let my_controllers=[];
        let controller_upgrader_count={};
        for(let name in Game.rooms){
            let room = Game.rooms[name];
            if(room.controller.my){
                my_controllers.push(room.controller.id);
                controller_upgrader_count[room.controller.id]=0;
            }
        }
        let upgraders=_.filter(Game.creeps,(creep)=>creep.memory.role=='upgrader');
        for(let creep of upgraders){
            let controller=Game.getObjectById(creep.memory.upgrade_controller)
            if(controller){
                controller_upgrader_count[controller.id]++;
            }
        }
        for(let creep of upgraders){
            if(!creep.memory.upgrade_controller){
                for(let controller of my_controllers){
                    if(controller_upgrader_count[controller]<upgraders.length/my_controllers.length){
                        creep.memory.upgrade_controller=controller;
                        controller_upgrader_count[controller]++;
                    }
                }
            }
        }
    },
    tower_distribute:function(){
        let my_towers=[];
        let tower_charger_count={};
        for(let name in Game.rooms){
            let room = Game.rooms[name];
            let towers=room.find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_TOWER,my:true}});
            towers.forEach(obj => {
                my_towers.push(obj.id);
                tower_charger_count[obj.id]=0;
            });
        }
        let chargers=_.filter(Game.creeps,(creep)=>creep.memory.role=='charger');
        for(let creep of chargers){
            let tower = Game.getObjectById(creep.memory.charge_tower);
            if(tower){
                tower_charger_count[tower.id]++;
            }
        }
        for(let creep of chargers){
            let tower = Game.getObjectById(creep.memory.charge_tower);
            if(!tower){
                for(let tower_id of my_towers){
                    if(tower_charger_count[tower_id]<chargers.length/my_towers.length){
                        creep.memory.charge_tower=tower_id;
                        tower_charger_count[tower_id]++;
                    }
                }
            }
        }
    }
};
module.exports = gameOperation;