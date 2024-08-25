let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleCharger=require('role.charger');
let roleCourier=require('role.courier');
let roleRepairer=require('role.repairer');
let roleWithdrawer=require('role.withdrawer');
let roleBalancer=require('role.balancer');

let roleExplorer=require('role.explorer');
let roleKiller=require('role.killer');
let roleCleaner=require('role.cleaner');

let gameOperation = require('game_operation');
let towerOperation = require('tower_operation');
let roomOccupied = require('room_occupied');

module.exports.loop = function () {
    let store_energy=0;
    for(let name in Game.rooms){
        let room=Game.rooms[name];
        let storage=room.storage;
        if(storage){//顯示不同房間storage能量
            room.visual.text(
                '⚡'+storage.store[RESOURCE_ENERGY],
                storage.pos.x+1,
                storage.pos.y+0.2,
                {align: 'left', opacity: 0.8}
            )
        }
        let controller=room.controller;
        if(controller&&controller.my){//如果房間控制器屬於自己 顯示升級進度
            let progress=(controller.progress/controller.progressTotal)*100;
            room.visual.text(
                '🏃'+progress.toFixed(3)+'%',
                controller.pos.x+1,
                controller.pos.y+0.2,
                {align: 'left', opacity: 0.8}
            )
        }
        let store_energy_containers= room.find(FIND_STRUCTURES,{filter:(structure)=>{
            return (structure.structureType==STRUCTURE_CONTAINER||structure.structureType==STRUCTURE_STORAGE);
        }});
        for(let container of store_energy_containers){
            store_energy+=container.store.getUsedCapacity(RESOURCE_ENERGY);
        }
    }
    if(Game.time%1500==0){
        Memory.store_energy_history=Memory.store_energy;
        Memory.store_energy=store_energy;
    }
    for(let name in Game.rooms){
        let room=Game.rooms[name];
        let flags= room.find(FIND_FLAGS,{filter:(flag)=>{
            return flag.name.includes('display_store_energy');
        }});
        for(let flag of flags){
            flag.room.visual.text(
                store_energy+'(⚡'+((Memory.store_energy-Memory.store_energy_history)/1500).toFixed(3)+'/t)'+'['+(1500-(Game.time%1500))+']', 
                flag.pos.x,
                flag.pos.y+2, 
                {align: 'center', opacity: 0.8}
            ); 
        }
        flags= room.find(FIND_FLAGS,{filter:(flag)=>{
            return flag.name.includes('display_cpu');
        }});
        for(let flag of flags){
            flag.room.visual.text(
                Game.cpu.bucket, 
                flag.pos.x,
                flag.pos.y+2, 
                {align: 'center', opacity: 0.8}
            ); 
        }
    }
    
    for(let creep_name in Game.creeps) {
        let creep = Game.creeps[creep_name];
        if(!creep.memory.return_spawn_name){
            let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            if(spawn)creep.memory.return_spawn_name=spawn.name;
        }
        if(creep.memory.role&&creep.memory.role=='harvester'){//採集者初始化
            creep.memory['targeted']=0;
        }
        if(creep.memory.role&&creep.memory.role=='courier'){//搬運工初始化
            if(!Memory.recycling_reserve)Memory.recycling_reserve={};
            let recycling=Game.getObjectById(creep.memory.recycling);
            if(recycling){
                Memory.recycling_reserve[creep.memory.recycling]=0;
            }
            if(!Memory.drop_reserve)Memory.drop_reserve={};
            let drops=Game.getObjectById(creep.memory.drops);
            if(drops){
                Memory.drop_reserve[creep.memory.drops]=0;
            }
        }
        if(creep.memory.explore && !creep.memory.path_length){//探索者初始化
            creep.memory['path_length']=1;
        }
        if(creep.memory.role=='upgrader'&&!Game.getObjectById(creep.memory.upgrade_controller))gameOperation.controller_distribute();//升級者初始化
        if(creep.memory.role=='charger'&&!Game.getObjectById(creep.memory.charge_tower))gameOperation.tower_distribute();//充能者初始化
    }

    for(let recycling_id in Memory.recycling_reserve){//Memory清除
        let recycling=Game.getObjectById(recycling_id);
        if(!recycling||(recycling.store&&!recycling.store.getUsedCapacity()>0))delete Memory.recycling_reserve[recycling_id];
    }
    for(let drops_id in Memory.drop_reserve){//Memory清除
        let drops=Game.getObjectById(drops_id);
        if(!drops)delete Memory.drop_reserve[drops_id];
    }
    for(let creep_name in Game.creeps){
        let creep = Game.creeps[creep_name];
        if(creep.memory.role&&creep.memory.role=='courier'){
            let customer=Game.getObjectById(creep.memory.customer);//把採集者當成目標的搬運工數
            if(customer){
                customer.memory.targeted++;
            }
            let recycling=Game.getObjectById(creep.memory.recycling);//墳墓 廢墟 或能量的預定搬運量
            if(recycling){
                Memory.recycling_reserve[recycling.id]+=creep.store.getFreeCapacity();
            }
            let drops=Game.getObjectById(creep.memory.drops);//墳墓 廢墟 或能量的預定搬運量
            if(drops){
                Memory.drop_reserve[drops.id]+=creep.store.getFreeCapacity();
            }
        }
    }
    
    towerOperation.run();//防禦塔運作
    Memory.creep_respawn=gameOperation.creep_respawn();//creep重生 同時回傳是否需要重生
    if(!Memory.creep_respawn)roomOccupied.run();//房間讀取
    for(let name in Game.spawns){
        let spawn=Game.spawns[name];//顯示房間可用能量
        spawn.room.visual.text(
            spawn.room.energyAvailable+'/'+spawn.room.energyCapacityAvailable,
            spawn.pos.x,
            spawn.pos.y+2,
            {align: 'center', opacity: 0.8}
        );
        if(spawn.spawning) {//顯示正在生成的creep的role與生成進度
            let spawningCreep = Game.creeps[spawn.spawning.name];
            let process =(1-spawn.spawning.remainingTime/spawn.spawning.needTime)*100
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role+'('+process.toFixed(1)+'%)',
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8}
            );
        }
    }
    for(let creep_name in Game.creeps) {
        let creep = Game.creeps[creep_name];
        let kit_icon={
            harvester:'⛏️',
            upgrader:'🆙',
            builder:'🧱',
            repairer:'🩹',
            charger:'🔋',
            killer:'🗡️',
            courier:'📦',
            cleaner:'🧹',
            balancer:'⚖️',
            withdrawer:'💵',
            occupier:'🚩'
        }
        if(creep.memory.role && creep.memory.role in kit_icon)creep.say(kit_icon[creep.memory.role]);
        else if(creep.memory.role)creep.say(creep.memory.role);
        else if(creep.memory.explore) creep.say(creep.memory.explore,true);

        if(creep.memory.explore){//有探索時探索優先
            roleExplorer.run(creep);
            continue;
        }
        if(creep.memory.working){
            let role=creep.memory.role;
            switch(role){
                case 'harvester':
                    roleHarvester.run(creep);
                    break;
                case 'upgrader':
                    roleUpgrader.run(creep);
                    break;
                case 'builder':
                    roleBuilder.run(creep);
                    break;
                case 'charger':
                    roleCharger.run(creep);
                    break;
                case 'killer':
                    roleKiller.run(creep);
                    break;
                case 'cleaner':
                    roleCleaner.run(creep);
                    break;
                case 'courier':
                    roleCourier.run(creep);
                    break;
                case 'repairer':
                    roleRepairer.run(creep);
                    break;
                case 'occupier'://以下指令根據explore不同生出佔領不同房間的creep
                    //Game.spawns['Spawn1'].spawnCreep([MOVE,CLAIM],'occupier'+Game.time,{memory:{role:'occupier',working:true,explore:'W8N7'}});
                    if(!creep.room.controller.my){
                        if(creep.room.controller){
                            if(creep.claimController(creep.room.controller)==ERR_NOT_IN_RANGE){
                                creep.moveTo(creep.room.controller,{visualizePathStyle: {stroke: '#ffffff'}})
                            }
                        }
                    }
                    break;
                case 'withdrawer':
                    roleWithdrawer.run(creep);
                    break;
                case 'balancer':
                    roleBalancer.run(creep);
                    break;
            }
        }
        else{//沒工作者就來升級
            if(creep.room.controller.my){
                roleUpgrader.run(creep);
            }
        }
    }
}