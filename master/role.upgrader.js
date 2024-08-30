let roleUpgrader = {
    run: function(creep) {
        if(!creep.memory.arrived){
            if(!creep.memory.upgrade_controller){}
            else if(creep.memory.upgrade_controller&&creep.room!=Game.getObjectById(creep.memory.upgrade_controller).room){
                let containers = Game.getObjectById(creep.memory.upgrade_controller).room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType==STRUCTURE_STORAGE||structure.structureType==STRUCTURE_SPAWN||structure.structureType==STRUCTURE_EXTENSION||structure.structureType==STRUCTURE_CONTAINER);
                    }
                });
                let energy_amount=0;
                if(containers.length>0){
                    for(let container of containers){
                        energy_amount+=container.store[RESOURCE_ENERGY];
                    }   
                }
                if(energy_amount<=500)creep.memory.arrived=true;
            }
            else{
                creep.memory.arrived=true;
            }
        }
        if(!creep.memory.arrived){
            let controller=Game.getObjectById(creep.memory.upgrade_controller);
            if(controller){
                creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
                return;
            }
        }
        
        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.memory.working=true;
        }
        if(!creep.memory.upgrading && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.upgrading = true;
        }
        
        if(creep.memory.upgrading) {
            let controller=Game.getObjectById(creep.memory.upgrade_controller);
            if(controller){
                if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
        else {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType==STRUCTURE_STORAGE||structure.structureType==STRUCTURE_SPAWN||structure.structureType==STRUCTURE_EXTENSION||structure.structureType==STRUCTURE_CONTAINER) &&
                        structure.store[RESOURCE_ENERGY] >=50;
                }
            });
            targets.sort((a,b)=>b.store[RESOURCE_ENERGY]-a.store[RESOURCE_ENERGY]);
            if(targets.length>0) {
                if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#00ffff'}});
                }
            }
            else{
                creep.moveTo(Game.spawns[creep.memory.return_spawn_name]);
            }
        }
    }
};

module.exports = roleUpgrader;