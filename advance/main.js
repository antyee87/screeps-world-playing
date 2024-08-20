let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleCharger=require('role.charger');
let roleCourier=require('role.courier');
let roleRepairer=require('role.repairer');

let roleExplorer=require('role.explorer');
let roleKiller=require('role.killer');
let roleCleaner=require('role.cleaner');

let gameOperation = require('game_operation');
let towerOperation = require('tower_operation');
let roomOccupied = require('room_occupied');

module.exports.loop = function () {
    for(let name in Game.rooms){
        let room=Game.rooms[name];
        let storage=room.storage;
        if(storage){
            room.visual.text(
                '⚡'+storage.store[RESOURCE_ENERGY],
                storage.pos.x+1,
                storage.pos.y+0.2,
                {align: 'left', opacity: 0.8}
            )
        }
        let controller=room.controller;
        if(controller&&controller.my){
            let progress=(controller.progress/controller.progressTotal)*100;
            room.visual.text(
                '🏃'+progress.toFixed(3)+'%',
                controller.pos.x+1,
                controller.pos.y+0.2,
                {align: 'left', opacity: 0.8}
            )
        }
    }
    for(let creep_name in Game.creeps) {
        let creep = Game.creeps[creep_name];
        if(creep.memory.role&&creep.memory.role=='harvester'){
            creep.memory['targeted']=0;
            if(!creep.memory['path_length'])creep.memory['path_length']=0;
        }
        if(creep.memory.explore && !creep.memory.role){
            if(!creep.memory['path_length'])creep.memory['path_length']=0;
        }
    }
    for(let creep_name in Game.creeps) {
        let creep = Game.creeps[creep_name];
        if(creep.memory.role&&creep.memory.role=='courier'){
            if(creep.memory.customer){
                let customer=Game.getObjectById(creep.memory.customer);
                if(customer)customer.memory.targeted++;
            }
        }
    }
    towerOperation.run();
    Memory.creep_respawn=gameOperation.creep_respawn();
    if(!Memory.creep_respawn)roomOccupied.run();
    let targets=[];
    for(let name in Game.spawns){
        let spawn=Game.spawns[name];
        spawn.room.visual.text(
            spawn.room.energyAvailable+'/'+spawn.room.energyCapacityAvailable,
            spawn.pos.x,
            spawn.pos.y+3,
            {align: 'center', opacity: 0.8}
        );
    }
    if(Game.spawns['Spawn1'].spawning) {
        let spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        let process =(1-Game.spawns['Spawn1'].spawning.remainingTime/Game.spawns['Spawn1'].spawning.needTime)*100
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role+'('+process.toFixed(1)+'%)',
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8}
        );
    }
    for(let creep_name in Game.creeps) {
        let creep = Game.creeps[creep_name];
        let source=Game.getObjectById(creep.memory.source);
        if(!creep.memory.source && creep.memory.role=='harvester'){
            let sources=gameOperation.source_distribute().sources;
            creep.memory['source']=sources[Math.floor(Math.random()*sources.length)];
        }
        else{
            let kit_icon={
                harvester:'⛏️',
                upgrader:'🆙',
                builder:'🧱',
                repairer:'🩹',
                charger:'🔋',
                killer:'🗡️',
                courier:'📦',
                cleaner:'🧹'
            }
            if(creep.memory.role && creep.memory.role in kit_icon)creep.say(kit_icon[creep.memory.role]);
            else if(creep.memory.role)creep.say(creep.memory.role);
            else if(creep.memory.explore) creep.say(creep.memory.explore,true);
            if(creep.memory.explore){
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
                    case 'occupier':
                        //Game.spawns['Spawn1'].spawnCreep([MOVE,CLAIM],'occupier'+Game.time,{memory:{role:'occupier',working:true,explore:'W8N7'}});
                        if(!creep.room.controller.my){
                            if(creep.room.controller){
                                if(creep.claimController(creep.room.controller)==ERR_NOT_IN_RANGE){
                                    creep.moveTo(creep.room.controller,{visualizePathStyle: {stroke: '#ffffff'}})
                                }
                            }
                        }
                        break;
                }
            }
            else{
                if(creep.room.controller.my){
                    roleUpgrader.run(creep);
                }
            }
        }
    }
}