let roleCleaner = {
    /** @param {Creep} creep **/
    run: function(creep) {
        let target=creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_INVADER_CORE)
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
                let invader_cores = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_INVADER_CORE)
                    }
                });
                let cleaners=_.filter(Game.creeps,(creep)=>{
                    return creep.memory.role=='cleaners' && (creep.room.name==name||(creep.memory.explore &&creep.memory.explore==room.name));
                })
                if(invader_cores.length>cleaners.length){
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
module.exports = roleCleaner;