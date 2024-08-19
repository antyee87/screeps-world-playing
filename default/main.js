var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleCollector=require('role.collector');
var roleRepairer=require('role.repairer');
var roleExplorer=require('role.explorer');
var roleKiller=require('role.killer');

var gameOperation = require('game_operation');
var towerOperation = require('tower_operation');
var roomOccupied = require('room_occupied');

module.exports.loop = function () {
    towerOperation.run();
    roomOccupied.run();
    gameOperation.creep_respawn();
    let targets=[];
    for(var name in Game.spawns){
        let spawn=Game.spawns[name];
        spawn.room.visual.text(
            spawn.room.energyAvailable+'/'+spawn.room.energyCapacityAvailable,
            spawn.pos.x,
            spawn.pos.y+2,
            {align: 'center', opacity: 0.8}
        );
    }
    let sources=gameOperation.source_distribute();
    if(Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8}
        );
    }
    
    for(var creep_name in Game.creeps) {
        var creep = Game.creeps[creep_name];
        let source=Game.getObjectById(creep.memory.source);
        if(creep.memory.origin_source){
            let origin_source=Game.getObjectById(creep.memory.origin_source);
            if(origin_source.energy>0){
                creep.memory['source']=creep.memory['origin_source'];
                creep.memory['origin_source']=null;
            }
        }
        if(!creep.memory.source ||(source && source.energy==0)){
            creep.memory['origin_source']=creep.memory['source'];
            creep.memory['source']=sources[Math.floor(Math.random()*sources.length)];
        }
        
        if(creep.memory.working==false&&creep.room!=Game.spawns['Spawn1'].room){
            creep.say('back home');
            const exitDir=creep.room.findExitTo(Game.spawns['Spawn1'].room);
            const exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        else{
            creep.say(creep.memory.role);
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
                    case 'collector':
                        roleCollector.run(creep);
                        break;
                    case 'repairer':
                        roleRepairer.run(creep);
                        break;
                    case 'explorer':
                        roleExplorer.run(creep);
                        break;
                    case 'killer':
                        roleKiller.run(creep);
                        break;
                }
            }
            else{
                if(creep.room.controller.owner){
                    roleUpgrader.run(creep);
                }
                else if(creep.memory.building){
                    creep.memory.building=false;
                }
            }
        }
    }
}