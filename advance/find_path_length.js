let findPathLength={
    find:function(origin,goal){
        if(!origin instanceof RoomPosition||!goal instanceof RoomPosition){
            return 0;
        }
        else{
            let path_length=0
            let path=origin.findPathTo(goal,{ignoreCreeps:true});
            if(origin.roomName!= goal.roomName){
                let end_pos = path[path.length-1];
                let roomName=origin.roomName;
                let roomName_W=Number(roomName.slice(1,2));
                let roomName_N=Number(roomName.slice(3));
                if(end_pos.x==0){
                    roomName_W++;
                    end_pos.x=49;
                }
                else if(end_pos.x==49){
                    roomName_W--;
                    end_pos.x=0;
                }

                if(end_pos.y==0){
                    roomName_N++;
                    end_pos.y=49;
                }
                else if(end_pos.y==49){
                    roomName_N--;
                    end_pos.y=0;
                }
                roomName='W'+roomName_W+'N'+roomName_N;

                origin = new RoomPosition(end_pos.x, end_pos.y,roomName);
                path_length +=findPathLength.find(origin,goal);
            }
            path_length+=path.length;
            return path_length;
        }
    }
};

module.exports = findPathLength;