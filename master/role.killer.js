let roleKiller = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.hits<creep.hitsMax){
            creep.heal(creep);
        }
        let target=creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{
            filter:(creep)=>{
                return (creep.getActiveBodyparts(ATTACK)>0||creep.getActiveBodyparts(RANGED_ATTACK)>0);
            }
        });
        if(target){
            const targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
            if(targets.length > 0) {
                creep.rangedAttack(targets[0]);
            }
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            return;
        }
        
        else{
            for(let name in Game.rooms){
                let room=Game.rooms[name];
                let hostile_creeps = room.find(FIND_HOSTILE_CREEPS,{filter:(creep)=>{
                    return (creep.getActiveBodyparts(ATTACK)>0||creep.getActiveBodyparts(RANGED_ATTACK)>0);
                    }
                });
                let killers=_.filter(Game.creeps,(creep)=>{
                    return creep.memory.role=='killer' && (creep.room.name==name||(creep.memory.explore &&creep.memory.explore==room.name));
                })
                if(hostile_creeps.length*2>killers.length){
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