import reactivateInactive from "./reactivateInactive"
import Item from "../entities/Item"

export default function(config, bounce) {
    //Tries to fetch an unused Item Object
    let item = reactivateInactive(World.items, config.position.x, config.position.y)
    //Creates new Item if unable to fetch old object
    if(!item){
        item = new Item({x:config.position.x, y:config.position.y, spriteKey:config.spriteKey},config.props)
        World.items.push(item)
    }

    //Init values that are missing from recycled objects
    item.id = assignId()
    item.setTexture(config.spriteKey)
    item.type = config.props.type 
    item.props = config.props

    if(bounce){
        item.body.setVelocityX((Math.random()-0.5)*200)
        item.body.setVelocityY(-500)
        World.time.delayedCall(
            40*frame, 
            function(){ item.body.setVelocityX(0) },
            null, item)
    }
}
