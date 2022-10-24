import Slasher from "./Slasher";
import createHitbox from "../system/HitboxGenerator";

export default class Fodder extends Slasher{
    constructor(config,props){
        super(config,props)

        //Base Config
        this.hp = 60
        this.maxhp = this.hp
        this.baseMove = 100 * (1+Math.random()/5)

        //misc

        this.animations.idle = 'droid-fodder_idle'
        this.animations.move = 'droid-fodder_walk'
        this.animations.attack = 'droid-fodder_attack'
        
        //Sprite Initialisation
        this.sprite.play(this.animations.idle);
        
        //AI Ranges

        //Attacks
        this.attacks.closeAttack.windup = 30
        this.attacks.closeAttack.animation = this.animations.attack
        
        this.stepDuration = 60

        //Flags

// --- Chasing ---------------------------------------------------------------------------------------------
        
        this.state.chasing.links = [{
                newState: 'windup', //Close Attack
                weight: () => {
                    if(this.playerDis < this.attackRange && this.allow.attack)
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
                    //this.flash(this.attacks.closeAttack.windup)
                    }
            },
            {
                newState: 'idle',
                weight: () => { if(this.playerDis > this.chaseRange) return true; else return 0 }
            }]

        this.states = [this.state.idle, this.state.chasing,this.state.windup,this.state.launching,this.state.attacking]
// *** End of Constructor ******************************************************************************************
    }
   
    
// *** End of Class ************************************************************************************************
}