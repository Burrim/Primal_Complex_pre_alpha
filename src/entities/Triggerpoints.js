
import Phaser from 'phaser'


export default class Triggerpoint extends Phaser.GameObjects.Rectangle{
    constructor(position,props){
        super(World,position.x,position.y,32,32,0xffffff,0.00000000000001)
        this.key = props.key


        World.physics.world.enable(this);
        World.add.existing(this);
        this.body.allowGravity = false;
        this.setOrigin(0)
    }
    trigger(enemy){
        //Checks if the current key is allowed to trigger
        if(World.lockedTrigger[this.key]) return 

        //Locks current Key
        World.lockedTrigger[this.key] = true

        switch(this.key){
            case 'deathzone':
                player.takeDamage(20)
                player.x = player.respawnPoint.x
                player.y = player.respawnPoint.y
                player.body.setVelocityX(0)
                player.body.setVelocityY(0)
                World.lockedTrigger[this.key] = false
            break;
            case 'towerWakeup':
                World.towerLightOn()
            break;
            case 'savezone':
                SaveManager.save()
                World.time.delayedCall(300*frame,()=>{World.lockedTrigger[this.key] = false},null,this)
            break;
            case 'alphaPortalCheckpoint':
                global.portalCheckpoint = {x:player.x, y:player.y}
            break;
            case 'startBoss':
                SaveManager.save()
                World.time.delayedCall(60*frame,()=>{
                    World.setLights('finale',{visible:true})

                    World.time.delayedCall(60*frame,()=>{
                        World.wraith.disabled = false
                       World.wraith.sprite.setVisible(true)
                       World.wraith.body.allowGravity = true
                       particles.wraithEmerge.emit(World.wraith.x,World.wraith.y)
                       World.wraith.setAllow('attack',120)
                       Audio.playBGM('Boss')
                       Audio.playSE(World.wraith,'teleport',{global:true})
                        
                    },null,this)
                },null,this)
            break;
        }

    }
}