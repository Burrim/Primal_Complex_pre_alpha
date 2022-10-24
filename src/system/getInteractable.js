

export default function getInteractable(){
    let returnValue = false
    for(let i = 0; i < World.interactables.length; i++){
        if( World.interactables[i].interactReady){
            returnValue = World.interactables[i]
            break
        }
    }
    return returnValue
}