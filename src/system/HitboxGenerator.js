
import reactivateInactive from "./reactivateInactive";
import createHitboxArc from "./createHitboxArc";

export default function createHitbox(config){

//*** Initialisation ***************************************************************************************************
    
    let source; //The Creater of the Hitbox
    let hitbox //Object to Store Hitbox itself

    //Hitboxes that are bound to an entity get attached to a local array otherwise every hitbox gets attached to the World Scene
    if(config.private) source = config.user
    else source = World

    //Fetches Hitbox according to given Shape or creates new one if neccessary
    switch(config.type){
        case 'rectangle': 
        hitbox = reactivateInactive(source.hitboxes.rectangle, config.x, config.y)
        if(!hitbox){
            //Create new Rectangle
            hitbox = World.add.rectangle(config.x, config.y, config.width, config.height, 0xFF0000).setVisible(false);
            source.hitboxes.rectangle.push(hitbox)
            World.hitboxes.all.push(hitbox)
        }
        else hitbox.body.setSize(config.width, config.height)
        break;
        case 'circle': 
        hitbox = reactivateInactive(source.hitboxes.circle, config.x, config.y)
        if(!hitbox){
            //Create new Circle
            hitbox = World.add.circle(config.x, config.y, config.radius, 0x000000).setVisible(false);
            source.hitboxes.circle.push(hitbox)
            World.hitboxes.all.push(hitbox)
        }
        else hitbox.body.setSize(config.radius) //Reuses and adjusts old Circle
        break;
    }

    // *** Setup *******************************************************************************************************************

    //General Setup
    if(config.private) source.add(hitbox)
    hitbox.setVisible(false)

    //Initializes physics properties
    World.physics.world.enable(hitbox);
    World.add.existing(hitbox);
    hitbox.body.allowGravity = false;

    //Storing data inside hitbox for later use in interactions
    hitbox.private = config.private
    hitbox.ignore = config.ignore
    hitbox.attack = config.attack
    hitbox.user = config.user
    hitbox.deflect = config.attack.deflect
    hitbox.shake = config.shake

    //Every Parameter given to the hitbox for easy access
    hitbox.config = config
    
    //Stores the ID of every entity that already got hit, so it doesn't get continuosly hit every single frame.
    //If a linked hitbox is passed their hitlist is referenced instead of creating a new one
    if(config.link != undefined) hitbox.hitList = config.link.hitList
    else hitbox.hitList = [] 

    //Hitbox Orientation
    let anchorX = config.anchorX
    let anchorY = config.anchorY
    if(anchorY == undefined) anchorY = anchorX
    if(anchorX == undefined) { anchorX = 0.5; anchorY = 0.5}
    hitbox.setOrigin(anchorX,anchorY)

    //*** Special Cases ******************************************************************************************************

    //Makes the Hitbox Relative to Sprite Direction
    if(config.flipSensitive){
        if(hitbox.user.sprite.flipX){
            //When user looks to the left side
            if(anchorX == 0) anchorX = 1
            else if(anchorX == 1) anchorX = 0
        }
        hitbox.setOrigin(anchorX,anchorY)
    }
   
    //Turns the Hitbox upward or downward. 
    if(config.direction == 'up' || config.direction == 'down'){
        switch(config.direction){
            case 'up': anchorX = 0.5; anchorY = 1; break;
            case 'down': anchorX = 0.5; anchorY = 0; break;
        }
        hitbox.body.setSize(config.height, config.width) //Inverts sizing dimensions
        hitbox.setOrigin(anchorX,anchorY)
    }

    //*** Arc Mode **********************************************************************************************/
    
    if(config.startAngle)
    createHitboxArc(hitbox)

    //*** Functions ******************************************************************************************************

    //Duration management
    hitbox.deactivate = function(){
        this.setActive(false).setVisible(false)
        this.body.enable = false
        World.time.removeEvent(this.activeTimer)
        if(config.private) source.remove(hitbox)
    }

    hitbox.activeTimer = World.time.delayedCall(config.duration*frame, hitbox.deactivate, null, hitbox)

    //*** Return Value *****************************************************************************************/
    return hitbox
}