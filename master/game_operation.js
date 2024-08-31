let findPathLength = require('find_path_length');
let gameOperation={
    creep_respawn:function(){
        for(let name in Memory.creeps) {//清除已死creep的memory
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
        let no_tower_rooms_count=0,towers_count=0;
        for(let name in Game.rooms){//檢查我的沒有塔但有建築的房間
            let room = Game.rooms[name];
            let towers=room.find(FIND_MY_STRUCTURES,{filter:{structureType:STRUCTURE_TOWER}});
            let structures=room.find(FIND_STRUCTURES,{filter:(structure)=>{
                return structure.structureType==STRUCTURE_CONTAINER||structure.structureType==STRUCTURE_ROAD;
            }});
            towers_count+=towers.length;
            if(towers.length==0&&structures.length>0)no_tower_rooms_count++;
        }
        let invader_cores_count=0,hostile_creeps_count=0;//敵人撿查
        for(let name in Game.rooms){
            let room=Game.rooms[name];
            let invader_cores = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_INVADER_CORE)
                }
            });
            let hostile_creeps = room.find(FIND_HOSTILE_CREEPS,{filter:(creep)=>creep.getActiveBodyparts(ATTACK)>0||creep.getActiveBodyparts(RANGED_ATTACK)>0||creep.getActiveBodyparts(HEAL)>0});
            if(hostile_creeps.length>0){
                let towers=room.find(FIND_MY_STRUCTURES,{filter:{structureType:STRUCTURE_TOWER}});
                if(towers.length==0){
                    let creeps = _.filter(Game.creeps,(creep)=>creep.room==room);
                    for(let creep of creeps){
                        if(creep.memory.role){
                            if(creep.memory.role=='harvester'){
                                creep.memory.source=null;
                            }
                            if(creep.memory.role=='courier'){
                                creep.memory.customer=null;
                            }
                        }
                        creep.moveTo(Game.getObjectById(creep.memory.return_tower_id));
                    }
                }
            }
            
            invader_cores_count+=invader_cores.length;
            hostile_creeps_count+=hostile_creeps.length;
        }

        const kits=['killer','withdrawer','upgrader','harvester','courier','charger','builder','repairer','balancer','cleaner'];
        
        Memory.harvester_courier_rate=1.5;//每隻採集者分幾隻搬運工
        let limit={
            harvester:Memory.total_sources,
            builder:4,
            upgrader:4,
            charger:towers_count,
            repairer:no_tower_rooms_count,
            courier:Math.round(Memory.total_sources*Memory.harvester_courier_rate),
            killer:hostile_creeps_count,
            cleaner:invader_cores_count,
            withdrawer:2,
            balancer:10
        }
        
        if(Object.keys(Game.constructionSites).length==0)limit['builder']=0;//沒有建築就不生建築者
        
        let couriers =_.filter(Game.creeps,(creep)=>creep.memory.role=='courier'&&(!creep.ticksToLive||creep.ticksToLive>100));
        if(!Memory.fighting_phase)Memory.fighting_phase='idle';
        if(Memory.fighting_phase!='prepare'&&couriers.length!=0)limit['withdrawer']=0;//準備出兵或沒有搬運工時的應急措施

        if(Game.time%30==0){
            let storages=[];
            for(let name in Game.rooms){
                let room=Game.rooms[name];
                if(room.storage)storages.push({id:room.storage.id,store:room.storage.store[RESOURCE_ENERGY]});
            }            
            storages.sort((a,b)=>a.store-b.store);
            Memory.storages=storages;
        }
        if(Memory.storages[Memory.storages.length-1].store/Memory.storages[0].store<=1.5)limit['balancer']=0//容器能量平衡
        const body_type={
            harvester:'harvester',
            builder:'builder',
            upgrader:'upgrader',
            charger:'default',
            repairer:'builder',
            courier:'courier',
            killer:'killer',
            cleaner:'cleaner',
            withdrawer:'courier',
            balancer:'balancer'
        }
        const body_content={
            default:[WORK,WORK,CARRY,CARRY,MOVE,MOVE],
            upgrader:[WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            builder:[WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
            harvester:[WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE],
            courier:[CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            killer:[TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL],
            cleaner:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
            balancer:[CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
        }
        let creeps={};
        let line=0;
        let count={};
        let respawn=false;
        for(let kit of kits){
            creeps[kit] =_.filter(Game.creeps,(creep)=>creep.memory.role==kit&&(!creep.ticksToLive||creep.ticksToLive>100));
            count[kit]=creeps[kit].length;//職業人數計算
            if(count[kit]>0||limit[kit]>0){//顯示
                for(let name in Game.rooms){
                    let room=Game.rooms[name];
                    let flags= room.find(FIND_FLAGS,{filter:(flag)=>{
                        return flag.name.includes('display_creeps_total');
                    }});
                    for(let flag of flags){
                        if(limit[kit]>0){
                            flag.room.visual.text(
                                kit+":" + count[kit]+'/'+limit[kit],
                                flag.pos.x,
                                flag.pos.y+line+2,
                                {align: 'center', opacity: 0.8}
                            );       
                        }
                        else{
                            flag.room.visual.text(
                                kit+":" + count[kit],
                                flag.pos.x,
                                flag.pos.y+line+2,
                                {align: 'center', opacity: 0.8}
                            );
                        }
                    }
                }
                line++;
            }
        }
        
        if(count['courier']<count['harvester']*Memory.harvester_courier_rate){//確保搬運工與採集者數量比例
            count['harvester']=limit['harvester'];
        }
        
        for(let kit of kits){//職業補全
            if(respawn)continue;
            let creep_body=body_content[body_type[kit]];
            for(let name in Game.spawns){
                let spawn=Game.spawns[name];
                if(spawn.spawning)continue;
                if(count[kit] < limit[kit]) {
                    let newName = kit + Game.time;
                    respawn=true;
                    spawn.spawnCreep(creep_body,newName,{memory: {role:kit,working:true}});
                }
                if(spawn.spawning)break;
            } 
        }
        let unemployment_harvesters=_.filter(Game.creeps,(creep)=>creep.memory.role=='harvester'&&!creep.memory.source);
        if(Game.time%30==0&&unemployment_harvesters.length>0){
            source_distribute_result=gameOperation.source_distribute();//能量點分配
            Memory.total_sources=source_distribute_result.total_sources;
            Memory.sources=source_distribute_result.sources;
        }
        for(let name in Game.creeps){
            let creep=Game.creeps[name];
            let source=Game.getObjectById(creep.memory.source);
            if(!source && creep.memory.role=='harvester'){
                let spawn_name=creep.memory.return_spawn_name;
                if(Memory.sources[spawn_name]&&Memory.sources[spawn_name].length>0){
                    creep.memory.source=Memory.sources[spawn_name][0];
                    for(let name in Memory.sources){
                        if(Memory.sources[name].length>0){
                            let index = Memory.sources[name].indexOf(creep.memory.source);
                            if (index !== -1) {
                                Memory.sources[name].splice(index, 1);
                            }
                        } 
                    }
                }
            }
        }
        gameOperation.recycling_drops_distribute();
        return respawn;
    },
    source_distribute:function(){//資源點分配
        let available_sources=[];
        for(let name in Game.rooms){
            let room=Game.rooms[name];
            if((!room.controller||(room.controller&&!room.controller.my))&&!Memory.occupied_rooms.includes(name))continue;//不被佔領的房間資源不納入分配
            let hostile_creeps=room.find(FIND_HOSTILE_CREEPS,{
                filter:(creep)=>{
                    return (creep.getActiveBodyparts(ATTACK)>0||creep.getActiveBodyparts(RANGED_ATTACK)>0);
                }
            });
            if(hostile_creeps.length>0)continue;//有敵人的房間的資源不納入分配
            if(room.controller&&room.controller.reservation&&room.controller.reservation.username!=Memory.username)continue;//被預定房間的資源不納入分配
            let sources=room.find(FIND_SOURCES);
            sources.forEach(obj=>{available_sources.push(obj.id)})
        }
        for(let name in Game.spawns){
            if(!Memory.source_path_length)Memory.source_path_length={};
            for(let source of available_sources){
                if(!Memory.source_path_length[name])Memory.source_path_length[name]={};
                if(!Memory.source_path_length[name][source]){
                    Memory.source_path_length[name][source]=findPathLength.find(Game.getObjectById(source).pos,Game.spawns[name].pos);
                }
            }
        }
        let sorted_sources={};
        for(let name in Game.spawns){
            sorted_sources[name]=available_sources;
            sorted_sources[name].sort((a,b)=>Memory.source_path_length[name][a]-Memory.source_path_length[name][b]);
        }

        let source_user={};
        let total_sources=0;
        let source_weight={};
        let harvesters= _.filter(Game.creeps,(creep)=>creep.memory.role=='harvester'&&(!creep.ticksToLive||creep.ticksToLive>100));
        for(let id of available_sources){
            source_user[id]=0;
        }
        for(let creep of harvesters){
            let source=Game.getObjectById(creep.memory.source);
            if(source)source_user[source.id]++;//計算資源使用人數
        }
        for(let id of available_sources){
            let source=Game.getObjectById(id);
            if(source){
                if(source.room.controller.reservation>0)continue;
                let posX=source.pos.x;
                let posY=source.pos.y;
                if(!source_weight[source.id])source_weight[source.id]=0;
                for(let x=-1;x<=1;x++){//計算可待格數
                    for(let y=-1;y<=1;y++){
                        const look = source.room.lookAt(new RoomPosition(posX+x,posY+y,source.room.name));
                        for(let object of look){
                            if(object.type=='terrain'){
                                if(object.terrain!='wall'){
                                    source_weight[source.id]++;
                                    break;
                                }
                            }
                            if(object.type=='structure'){
                                let has_road=false;
                                for(let i in object.structure){
                                    if(object.structure[i]=='road'){
                                        source_weight[source.id]++;
                                        has_road=true;
                                        break;
                                    }
                                }
                                if(has_road)break;
                            }
                        }
                    }
                }
                if(source_weight[source.id]>2)source_weight[source.id]=2;//計算可待格數 大於2時設為2
                total_sources+=source_weight[source.id];
                source_weight[source.id]-=source_user[id];//需補全採集者數量計算
                if(source_weight[source.id]<0)source_weight[source.id]=0;
            }
        }
        let sources = {};
        for(let name in Game.spawns){
            sources[name]=[];
            for(let source_id of sorted_sources[name]){
                for(let j=0;j<source_weight[source_id];j++){
                    sources[name].push(source_id);
                }
            }
        }
        const return_object={
            total_sources:total_sources,
            sources:sources,
        };
        return return_object;
    },
    controller_distribute:function(){//升級者升級控制器分配
        let my_controllers=[];
        let controller_upgrader_count={};
        for(let name in Game.rooms){
            let room = Game.rooms[name];
            if(room.controller&&room.controller.my){
                my_controllers.push(room.controller.id);
                controller_upgrader_count[room.controller.id]=0;
            }
        }
        let upgraders=_.filter(Game.creeps,(creep)=>creep.memory.role=='upgrader'&&(!creep.ticksToLive||creep.ticksToLive>100));
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
    tower_distribute:function(){//充能者充能塔分配
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
        let chargers=_.filter(Game.creeps,(creep)=>creep.memory.role=='charger'&&(!creep.ticksToLive||creep.ticksToLive>100));
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
    },
    recycling_drops_distribute:function(){
        let tombstones,ruins,drops;
        if(!Memory.recycling_reserve)Memory.recycling_reserve={};
        if(!Memory.drop_reserve)Memory.drop_reserve={};
        
        for(let name in Game.rooms){
            let room = Game.rooms[name];
            tombstones=room.find(FIND_TOMBSTONES,{filter:(tombstone)=>{
                return tombstone.store.getUsedCapacity()>0 && (!Memory.recycling_reserve[tombstone.id]||Memory.recycling_reserve[tombstone.id]<tombstone.store.getUsedCapacity());
            }});
            ruins=room.find(FIND_RUINS,{filter:(ruin)=>{
                return ruin.store.getUsedCapacity()>0 && (!Memory.recycling_reserve[ruin.id]||Memory.recycling_reserve[ruin.id]<ruin.store.getUsedCapacity());
            }});
            drops=room.find(FIND_DROPPED_RESOURCES,{filter:(drops)=>{
                return (!Memory.recycling_reserve[drops.id]||Memory.recycling_reserve[drops.id]<drops.amount);
            }});
            for(let tombstone of tombstones){
                let creep = tombstone.pos.findClosestByRange(FIND_MY_CREEPS,{filter:(creep)=>{
                    return creep.memory.role=='courier'&& (!creep.recycling&&!creep.drops) && !creep.memory.delivering && creep.store.getFreeCapacity()>0;
                }});
                if(!Memory.recycling_reserve[tombstone.id])Memory.recycling_reserve[tombstone.id]=0;
                if(creep){
                    creep.memory.recycling=tombstone.id;
                    Memory.recycling_reserve[tombstone.id]+=creep.store.getFreeCapacity();
                    return;
                }
            }
            for(let ruin of ruins){
                let creep = ruin.pos.findClosestByRange(FIND_MY_CREEPS,{filter:(creep)=>{
                    return creep.memory.role=='courier'&& (!creep.recycling&&!creep.drops) && !creep.memory.delivering && creep.store.getFreeCapacity()>0;
                }});
                if(!Memory.recycling_reserve[ruin.id])Memory.recycling_reserve[ruin.id]=0;
                if(creep){
                    creep.memory.recycling=ruin.id;
                    Memory.recycling_reserve[ruin.id]+=creep.store.getFreeCapacity();
                    return;
                }
            } 
            for(let drop of drops){
                let creep = drop.pos.findClosestByRange(FIND_MY_CREEPS,{filter:(creep)=>{
                    return creep.memory.role=='courier'&& (!creep.recycling&&!creep.drops) && !creep.memory.delivering && creep.store.getFreeCapacity()>0;
                }});
                if(!Memory.drop_reserve[drop.id])Memory.drop_reserve[drop.id]=0;
                if(creep){
                    creep.memory.drops=drop.id;
                    Memory.drop_reserve[drop.id]+=creep.store.getFreeCapacity();
                    return;
                }
            }
        }   
    }
};
module.exports = gameOperation;