export default class Orb extends Phaser.GameObjects.Sprite{
    constructor(x,y,speed,turnSpeed,rotation, duration){
        super(World,x,y,'particle-orbs')

        //Beta. Remove later and integrate Orbs as a Hitbox extension
        World.orbs.push(this)

        this.type = 'orb'

        if(rotation == undefined) rotation = 0

        this.speed = speed //Speed of the Orb
        this.turnSpeed = turnSpeed //Speed of the rotation of the orb. Higher values causes smaller arcs

        this.measure = { //Debug Value that can help with determining the radius of the movement arc
            start: y,
            end: y
        }
        //Physics Setup
        World.add.existing(this);
        World.physics.world.enable(this)
        this.body.allowGravity = false
        this.body.setSize(24, 24, true);
        

        //Rotation Based Setup
        this.body.setAngularVelocity(turnSpeed);
        this.setRotation(Phaser.Math.DegToRad(rotation))

        this.play('particle-orbs')

        if(duration != undefined)
        World.time.delayedCall(duration*frame,()=>{this.die(true)},null,this)


    }
    move(){
        if(!this.active) return
        World.physics.velocityFromRotation(Phaser.Math.DegToRad(this.body.rotation), this.speed, this.body.velocity);
        //Debug
        //if(this.y > this.measure.end) this.measure.end = this.y
        //console.log(this.measure.end - this.measure.start)
    }

    //Currently Orbs are lending some enemy type properties but in the future they need to be streamlined
    takeDamage(damage){
        this.die()
    }

    die(silent){
        if(!this.active) return
        this.setActive(false).setVisible(false)
        this.body.enable = false
        if(!silent) particles.wraithEmerge.emit(this.x,this.y)
    }
}