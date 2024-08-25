let roleCourier={
    run:function(creep){
        if(!creep.memory.delivering&&creep.store.getFreeCapacity()==0){
            creep.memory.customer=null;
            creep.memory.time=0;
            creep.memory.delivering=true;
        }
        if(creep.memory.delivering&&creep.store.getUsedCapacity() == 0){
            creep.memory.time=0;
            creep.memory.recycling=null;
            creep.memory.drops=null;
            creep.memory.delivering=false;
            creep.memory.destination=null;
            let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            if(spawn)creep.memory.return_spawn_name=spawn.name;
        }
        if(Memory.run_away){
            let tower=creep.pos.findClosestByRange(STRUCTURE_TOWER);
            if(tower){
                creep.moveTo(tower);
                return;
            }
            else{
                creep.moveTo(Game.spawns[creep.memory.return_spawn_name]);
                return;
            }
        }
        if(creep.memory.delivering){
            creep.memory.time++;
            let destination=Game.getObjectById(creep.memory.destination);
            if(destination){
                for(const resourceType in creep.store) {
                    if(destination.store.getFreeCapacity(resourceType)>0){
                        if(creep.transfer(destination, resourceType) == ERR_NOT_IN_RANGE) {
                            if(creep.moveTo(destination, {visualizePathStyle: {stroke: '#ffffff'},reusePath:10})==OK)creep.memory.time=0;
                        }
                    }
                    else{
                        creep.memory.destination=null;
                    }
                }
            }
            else{
                //設定目的地
                let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        if(structure.structureType==STRUCTURE_SPAWN||structure.structureType==STRUCTURE_EXTENSION){
                            for(const resourceType in creep.store){
                                if(!structure.store.getFreeCapacity(resourceType)||structure.store.getFreeCapacity(resourceType)==0){
                                    return  false;
                                }
                            }
                            return  true;
                        }
                        else{
                            return false;
                        }    
                    }
                });
                if(target) {
                    creep.memory.destination=target.id;
                }
                else{
                    target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType==STRUCTURE_STORAGE||structure.structureType==STRUCTURE_CONTAINER) &&
                                structure.store.getFreeCapacity() > 0;
                        }
                    });
                    if(target) {
                        creep.memory.destination=target.id;
                    }
                    else{
                        creep.moveTo(Game.spawns['Spawn1']);
                    }
                }  
                destination=Game.getObjectById(creep.memory.destination);
                if(destination)roleCourier.run(creep);
            }
            if(creep.memory.time>5){
                let target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: (creep) => {
                        return creep.memory.role!='harvester'&&creep.store.getFreeCapacity()>0;
                    }
                });
                if(target) {
                    if(creep.transfer(target, RESOURCE_ENERGY)==OK)creep.memory.time=0;
                }
            }
        }
        else{
            let customer=Game.getObjectById(creep.memory.customer);
            if(customer){
                let recycling=Game.getObjectById(creep.memory.recycling);//先挖墳 掏廢墟
                if(recycling&&recycling.store.getUsedCapacity()>0){
                    for(let resource_type in recycling.store){
                        if(creep.withdraw(recycling, resource_type) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(recycling, {visualizePathStyle: {stroke: '#ffffff'},reusePath:50});
                            break;
                        }
                    }
                }
                else{
                    creep.memory.recycling=null;
                    let drops=Game.getObjectById(creep.memory.drops);//再撿漏
                    if(drops&&drops.amount>0){
                        if(creep.pickup(drops) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(drops, {visualizePathStyle: {stroke: '#ffffff'},reusePath:50});
                        }
                    }
                    else{
                        creep.memory.drops=null;
                        //creep.moveTo(customer, {visualizePathStyle: {stroke: '#ffffff'},reusePath:50});
                        //最後才去收能源
                        if(customer.store[RESOURCE_ENERGY]<10&&customer.memory.targeted>Memory.harvester_courier_rate){
                            creep.memory.customer=null;
                            customer.memory.targeted--;
                        }
                        else{
                            creep.moveTo(customer, {visualizePathStyle: {stroke: '#ffffff'},reusePath:50});
                        }
                    }
                }  
            }
            else{
                //找沒人看上的能源最多的採集者
                if(!creep.memory.return_spawn_name){
                    let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                    if(spawn)creep.memory.return_spawn_name=spawn.name;
                    else creep.memory.return_spawn_name='Spawn1';
                }
                let targets =_.filter(Game.creeps,(target)=>target.memory.role == 'harvester'&&target.memory.targeted<Memory.harvester_courier_rate);
                targets.sort((a,b)=>{
                    return (3*b.store[RESOURCE_ENERGY]/Memory.source_path_length[creep.memory.return_spawn_name][b.memory.source])-(3*a.store[RESOURCE_ENERGY]/Memory.source_path_length[creep.memory.return_spawn_name][a.memory.source]);
                });
                if(targets.length>0){
                    targets[0].memory.targeted++;
                    creep.memory.customer=targets[0].id;
                }
                else if(creep.store[RESOURCE_ENERGY]>0){
                    creep.memory.delivering=true;
                }
                customer=Game.getObjectById(creep.memory.customer);
                if(customer)roleCourier.run(creep); 
            }
        }
        
    }
};

module.exports =roleCourier;