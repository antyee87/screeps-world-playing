let roleBuilder = {
    run: function(creep) {
        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
        }
        if(!creep.memory.building && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.building = true;
        }
        if(creep.memory.building) {
            let targets=[];
            for(let name in Game.rooms){
                let sites= Game.rooms[name].find(FIND_CONSTRUCTION_SITES);
                for(let site of sites){
                    if(site.structureType==STRUCTURE_TOWER||site.structureType==STRUCTURE_WALL||site.structureType==STRUCTURE_RAMPART)
                    {
                        targets.unshift(site.id);
                    }
                    else{
                        targets.push(site.id);
                    }
                }
            }
            if(targets.length) {
                let construction_site=Game.getObjectById(targets[0]);
                creep.memory.working = true;
                if(creep.build(construction_site) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(construction_site, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else{
                creep.memory.working =false;
                let my_controllers=[];
                for(let name in Game.rooms){
                    let room = Game.rooms[name];
                    if(room.controller.my){
                        my_controllers.push(room.controller.id);
                    }
                }
                if(!creep.memory.upgrade_controller)creep.memory.upgrade_controller=my_controllers[Math.floor(Math.random()*my_controllers.length)];//副業升級者
                creep.memory.upgrading=true;
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
                creep.moveTo(new RoomPosition(3,17,'W7N7'));
            }
        }
    }
};

module.exports =roleBuilder;