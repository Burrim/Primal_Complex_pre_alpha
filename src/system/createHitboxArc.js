import Phaser from "phaser";

export default function createHitboxArc(hitbox){
    let config = hitbox.config

    //Calculates Angle increments
    let travelDistance = config.endAngle - config.startAngle 

    //Timer object needs to be initialized first so it can be referenced in the timer itself later
    let timer = {
        hitbox : hitbox, 
        distance : config.distance,
        currentAngle : config.startAngle,
        stepDistance : travelDistance / (config.arcDuration-1),
        key : 'hitboxArc',
        interruptable: true, //Clears Timer on statechange when true.
        recycle: false, //Marks the Object so it can be overwritten.
    }
    if(timer.hitbox.config.flipSensitive && timer.hitbox.user.sprite.flipX){
        timer.stepDistance *= -1
    }

    timer.main = World.time.addEvent({
        delay: frame,                
        callback:  function() {
            Phaser.Math.RotateTo(this.hitbox,0,0,this.currentAngle,this.distance)
            this.currentAngle += this.stepDistance
        },
        callbackScope: timer,
        repeat: config.arcDuration-1
    })
    
    
}