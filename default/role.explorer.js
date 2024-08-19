var roleExplorer={
    run:function(creep){
        switch(creep.memory.dir){
            case 'left':
                creep.move(LEFT);
                creep.memory.dir=null;
                break;
            case 'right':
                creep.move(RIGHT);
                creep.memory.dir=null;
                break;
            case 'top':
                creep.move(TOP);
                creep.memory.dir=null;
                break;
            case 'bottom':
                creep.move(BOTTOM);
                creep.memory.dir=null;
                break;
        }
        let curr_room={
            x:creep.room.name.slice(1,2),
            y:creep.room.name.slice(3)
        };
        let goal_room={
            x:creep.memory.explore.slice(1,2),
            y:creep.memory.explore.slice(3)
        };
        if(curr_room.x<goal_room.x){
            const exit = creep.pos.findClosestByRange(FIND_EXIT_LEFT);
            creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffffff'}});
            creep.memory.dir='left';
        }
        else if(curr_room.x>goal_room.x){
            const exit = creep.pos.findClosestByRange(FIND_EXIT_RIGHT);
            creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffffff'}});
            creep.memory.dir='right';
        }
        else if(curr_room.y>goal_room.y){
            const exit = creep.pos.findClosestByRange(FIND_EXIT_BOTTOM);
            creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffffff'}});
            creep.memory.dir='bottom';
        }
        else if(curr_room.y<goal_room.y){
            const exit = creep.pos.findClosestByRange(FIND_EXIT_TOP);
            creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffffff'}});
            creep.memory.dir='top';
        }
        
    }
};
//Game.spawns['Spawn1'].spawnCreep([MOVE],'explorer'+Game.time,{memory: {role:'explorer',explore:'W8N7',working:true}});
module.exports = roleExplorer;