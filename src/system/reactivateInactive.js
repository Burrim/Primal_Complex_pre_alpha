export default function reactivateInactive(group,x,y,type){

    let returnValue = false;
    for(let i = 0; i < group.length; i++){

        if(!group[i].active){

            //Filters for Type in Groups that houses multiple classes
            if(type != undefined && group[i].type != type) return

            //Sets Position for where the entity should reappear
            group[i].setPosition(x,y)

            group[i].setActive(true).setVisible(true)
            if(group[i].body != undefined)
            group[i].body.enable = true

            returnValue =  group[i]
            break;
        }
    }
    return returnValue
    
}