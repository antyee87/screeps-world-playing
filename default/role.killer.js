var roleKiller = {
    /** @param {Creep} creep **/
    run: function(creep) {
        let targets=[];
        for(let name in Game.rooms){
            let room=Game.rooms[name];
            let invader_cores = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_INVADER_CORE)
                }
            });
            let hostile_creeps = room.find(FIND_HOSTILE_CREEPS);
            for(let i=0;i<invader_cores.length;i++){
                targets.push(invader_cores[i].id);
            }
            let hostile_structures = room.find(FIND_HOSTILE_STRUCTURES);
            for(let i=0;i<hostile_creeps.length;i++){
                targets.unshift(hostile_creeps[i].id);
            }
            for(let i=0;i<hostile_structures.length;i++){
                targets.push(hostile_structures[i].id);
            }
        }
        if(targets.length > 0) {
            console.log(Game.getObjectById(targets[0]));
            if(creep.attack(Game.getObjectById(targets[0])) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(targets[0]), {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};
//Game.spawns['Spawn1'].spawnCreep([ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE],'killer'+Game.time,{memory: {role:'killer',working:true}});
module.exports = roleKiller;