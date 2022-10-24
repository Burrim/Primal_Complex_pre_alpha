import Slasher from "./Slasher";
import createHitbox from "../system/HitboxGenerator";
import createProjectil from "../system/ProjectilGenerator"
import { genericEnemyPrj, fireball } from "../data/projectiles/projectileBlueprints";

export default class Thrower extends Slasher{
    constructor(config,props){
        super(config,props)

        //Base Config
        this.baseMove = 50 * (1+Math.random()/5)
        this.hp = 150

        //misc
        this.animations.idle = 'droid-thrower_idle'
        this.animations.move = 'droid-thrower_walk'
        this.animations.attack = 'droid-thrower_attack'
        this.animations.shoot = 'droid-thrower_shoot'
        
        //Sprite Initialisation
        //this.sprite.setTint('0x00FF00')
        this.sprite.play(this.animations.idle);
        
        //AI Ranges
        this.chaseRange = 600
        this.approachRange = 250
        this.attackRange = 100
        this.launchRange = 200
        this.aggroRange = 300
        this.callRange = 300
        this.shootRange = 500

        //Cooldowns
        this.shootcooldown = 90
        
        

        //Flags
        this.allow.shoot = true
        this.allow.idle =

// --- Chasing ---------------------------------------------------------------------------------------------
        this.state.chasing.events = () => {
            if(player.x > this.x && this.playerDis > this.approachRange) this.body.setVelocityX(this.baseMove)
            else if (player.x < this.x && this.playerDis > this.approachRange) this.body.setVelocityX(-this.baseMove)
            else this.body.setVelocityX(0)

            if(this.playerDis < this.shootRange && this.allow.shoot)
            this.shoot()

            //Animation
            if(this.body.velocity.x != 0 && !this.body.blocked.right && !this.body.blocked.left && this.allow.idle){
                if(this.sprite.anims.currentAnim.key != this.animations.move || !this.sprite.anims.isPlaying)
                this.sprite.play(this.animations.move);
            }
            else{
                if((this.sprite.anims.currentAnim.key != this.animations.idle || !this.sprite.anims.isPlaying) && this.allow.idle)
                this.sprite.play(this.animations.idle);
            }
        }
        this.state.chasing.links = [{
                newState: 'windup', //Close Attack
                weight: () => {
                    if(this.playerDis < this.attackRange && this.allow.attack && this.allow.idle)
                    return true; else return 0;
                },
                action: () => { 
                    if(this.x < player.x) this.sprite.flipX = false
                    else this.sprite.flipX = true
                    this.addTimer({duration: this.attacks.closeAttack.windup, interruptable: true, callback:()=>{
                        this.allow.attack = false
                        this.attack(this.attacks.closeAttack); 
                    }}) 
                    //Sprite Flashing
                    this.windupSprite = this.animations.attack
                    }
            },
            {
                newState: 'idle',
                weight: () => { if(this.playerDis > this.chaseRange) return true; else return 0 }
            }]

        //this.states = [this.state.idle, this.state.chasing,this.state.windup,this.state.launching,this.state.attacking]
// *** End of Constructor ******************************************************************************************
    }
    shoot(){
        
        this.sprite.play(this.animations.shoot)
        this.setAllow('idle', 60)
        this.setAllow('shoot',this.shootcooldown)
        if(this.x > player.x) this.sprite.flipX = true; else this.sprite.flipX = false
        World.time.delayedCall(15*frame, function(){
            if(this.x > player.x) this.sprite.flipX = true; else this.sprite.flipX = false
            Audio.playSE(this,'shoot1',{range:500})
            let src = createProjectil(new fireball(this, {gravity:true, arc:600, speed:this.playerDis*1}))
            createProjectil(new fireball(this, {gravity:true, arc:600, speed:this.playerDis*1.2, link: src}))
            createProjectil(new fireball(this, {gravity:true, arc:600, speed:this.playerDis*1.5, link: src}))

        },null,this)
        
    }
   
    
// *** End of Class ************************************************************************************************
}