let roleKiller = {
    run: function(creep) {
        if(creep.hits<creep.hitsMax){
            creep.heal(creep);
        }
        let target=creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter:(creep)=>creep.getActiveBodyparts(ATTACK)>0||creep.getActiveBodyparts(RANGED_ATTACK)>0||creep.getActiveBodyparts(HEAL)>0});
        if(!target)creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(target){
            let hostile_creeps=creep.room.find(FIND_HOSTILE_CREEPS,{filter:(creep)=>creep.getActiveBodyparts(ATTACK)>0||creep.getActiveBodyparts(RANGED_ATTACK)>0||creep.getActiveBodyparts(HEAL)>0});
            let killers=creep.room.find(FIND_MY_CREEPS,{filter:(creep)=>creep.memory.role&&creep.memory.role=='killer'});
            if(hostile_creeps>killers){
                creep.moveTo(Game.spawns[creep.memory.return_spawn_name]);
                return;
            }
            creep.rangedAttack(target);
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            return;
        }
        else{
            creep.memory.arrived=false;
            for(let name in Game.rooms){
                let room=Game.rooms[name];
                let hostile_creeps = room.find(FIND_HOSTILE_CREEPS,{filter:(creep)=>creep.getActiveBodyparts(ATTACK)>0||creep.getActiveBodyparts(RANGED_ATTACK)>0||creep.getActiveBodyparts(HEAL)>0});
                let killers=_.filter(Game.creeps,(creep)=>{
                    return creep.memory.role=='killer' && (creep.room.name==name||(creep.memory.explore &&creep.memory.explore==room.name));
                })
                if(hostile_creeps.length>killers.length){
                    creep.memory.explore=name;
                    return;
                }
            }
        }
        let spawn=creep.pos.findClosestByRange(FIND_MY_SPAWNS);
        if(spawn&&spawn.recycleCreep(creep)==ERR_NOT_IN_RANGE){
            creep.moveTo(spawn);
        }
        else{
            creep.moveTo(Game.spawns['Spawn1']);
        }
    }
};
module.exports = roleKiller;