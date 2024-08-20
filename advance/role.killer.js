let roleKiller = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.getActiveBodyparts(ATTACK)==0&&creep.getActiveBodyparts(RANGED_ATTACK)==0&&creep.getActiveBodyparts(HEAL)==0)creep.suicide();
        if(creep.hits<creep.hitsMax){
            creep.heal(creep);
        }
        let target=creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{
            filter:(creep)=>{
                return (creep.getActiveBodyparts(ATTACK)>0||creep.getActiveBodyparts(RANGED_ATTACK)>0);
            }
        });
        if(target){
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
                if(hostile_creeps.length>killers.length){
                    creep.memory.explore=name;
                    return;
                }
            }
        }
        creep.moveTo(new RoomPosition(3,17,'W7N7'));
    }
};
module.exports = roleKiller;