
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
        }
        if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
        }
        if(creep.memory.building) {
            var targets=[];
            for(var name in Game.rooms){
                var sites=(Game.rooms[name].find(FIND_CONSTRUCTION_SITES));
                for(var i=0;i<sites.length;i++){
                    if(sites[i].structureType==STRUCTURE_TOWER)
                    {
                        targets.unshift(sites[i].id);
                    }
                    else{
                        targets.push(sites[i].id);
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
            }
        }
        else {
            if(creep.harvest(Game.getObjectById(creep.memory['source'])) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory['source']),{visualizePathStyle:{stroke:'#ffaa00'}});
            }
        }
    }
};

module.exports = roleBuilder;
