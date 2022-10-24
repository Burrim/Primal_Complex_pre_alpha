import EntityBase from "./EntityBase";
import createHitbox from "../system/HitboxGenerator";
import hitboxes from "../data/hitboxes/slashBlueprints";

export default class Charger extends EntityBase{
    constructor(config,props){
        super(config,props)

        //Base Config
        this.hp = 100
        this.maxhp = this.hp
        this.baseMove = 100 * (1+Math.random()/5)
        this.launchX = 1000,
        this.launchY = -200,
        this.type = 'enemy'
        this.recoveryState = 'chasing'

        //misc
        this.windupSprite = 'alphaCharacter-Attack1'
        this.playerDirection;

        World.updateEvents.push(this.AInew)
        
        //Sprite Initialisation
        this.sprite.setTint('0xFF0000')
        this.sprite.play("alphaCharacter-Idle");
        this.body.setSize(32, 48, true);
        this.setSize(32, 48, true);
        this.initHealthbar()
        

        //AI Ranges
        this.chaseRange = 2000
        this.aggroRange = 1000

        //Cooldowns
        
        this.attacks = {
            Charge: {
                animation: 'alphaCharacter-Attack1',
                hitbox: 'BasicArcSlash',
                windup: 60,
                state:'charging',
                cooldown: 60,
                duration: 15,
                hitboxParam: {
                   ignore: {type : 'enemy'},
                   user: this,
                    attack:{
                        power: 30,
                        knockback: 5,
                        penetration: 20
                    }
                }
            },
            launchAttack: {},
        }

        //Flags
        this.allow = {
            stateChange: true,
            launch: true,
            attack:true,
            launchAttack: true
        }

        this.state = {
//-------------------- Idle -------------------------------------------------------------------------
        idle: {
            key: 'idle',
            idle:{},
            events: () => {
                if(this.body.velocity.x == 0){
                    if(this.sprite.anims.currentAnim.key != "alphaCharacter-Idle" || !this.sprite.anims.isPlaying)
                this.sprite.play("alphaCharacter-Idle")};
            },
            links: [{
                newState: 'chasing',
                weight: () => {
                    if(this.playerDis < this.aggroRange)
                    return true; else return 0;
                }, 
                action: this.aggro
            }]
        },
//-------------------- Chasing -------------------------------------------------------------------------
        chasing: {
            key: 'chasing',
            chasing: {},
            events: () => {
                if(player.x > this.x && this.playerDis > 100) this.body.setVelocityX(this.baseMove)
                else if (player.x < this.x && this.playerDis > 100) this.body.setVelocityX(-this.baseMove)
                else this.body.setVelocityX(0)

                //Animation
                if(this.body.velocity.x != 0){
                    if(this.sprite.anims.currentAnim.key != "alphaCharacter-Run" || !this.sprite.anims.isPlaying)
                    this.sprite.play("alphaCharacter-Run");
                }
                else{
                    if(this.sprite.anims.currentAnim.key != "alphaCharacter-Idle" || !this.sprite.anims.isPlaying)
                    this.sprite.play("alphaCharacter-Idle");
                }
            },
            links: [{
                newState: 'windup', //LaunchAttack
                weight: () => {
                    if(this.playerDis > this.launchRange && this.allow.attack) return 5
                    else return 0
                },
                action: () => {
                    this.setAllow('stateChange', 1)
                    this.addTimer({duration: this.attacks.launchAttack.windup, interruptable: true, callback:()=>{
                        this.attack(this.attacks.launchAttack); 
                    }})
                    this.direction;
                    if(this.x > player.x) this.direction = -1
                    else this.direction = 1 
                    this.windupSprite = 'alphaCharacter-Attack2'
                    this.tweens.flashing.resume()
                    this.addTimer({duration: this.attacks.launchAttack.windup, interruptable: false, callback: ()=>{
                        this.tweens.flashing.pause()
                        this.sprite.setTint('0xFF0000')
                    }})
                }
            },{
                newState: 'chasing', //Keeping the state as is
                weight: () => {if(this.playerDis > this.launchRange)return 5; else return 0},
                action: () => { if(this.allow.launch) this.setAllow('launching', 180)}
            },{
                newState: 'idle',
                weight: () => { if(this.playerDis > this.chaseRange) return true; else return 0 }
            }]
        },
    
    //-------------------- Windup --------------------------------------------------------------------------
    windup: {
        key: 'windup',
        windup: {},
        events: ()=> {
            this.body.setVelocityX(0)
            this.sprite.setTexture(this.windupSprite)
        },
        links:[]
        
    },
    //-------------------- Launching -------------------------------------------------------------------------
    launching: {
        key: 'Charging',
        launching: {},
        events: () => {
        },
        links: [{
            newState:'chasing',
            weight: () => {if(this.body.blocked.down && this.allow.stateChange)return true; else return 0}
        }]
    },
    //-------------------- Attacking -------------------------------------------------------------------------
    attacking: {
        key: 'attacking',
        attacking:{},
        events:()=>{},
        links:[]
        },
        
    }

    this.states = [this.state.idle, this.state.chasing,this.state.windup,this.state.launching,this.state.attacking]
    // *** End of Constructor ******************************************************************************************
}
genEvents(){
        this.playerDis = Phaser.Math.Distance.BetweenPoints(this,player)
    }
    genFollowEvents(){
        if(this.body.velocity.x < 0 && this.currentState != 'stunned') this.sprite.flipX = true
        else if(this.body.velocity.x > 0 && this.currentState != 'stunned') this.sprite.flipX = false
    }
    attack(attack){
        this.switchState({newState: attack.state})

        if(attack.onStartup) attack.onStartup()

        this.sprite.play(attack.animation);
        this.playSlashAnim('slash-SlashV5', 0, 10)
        createHitbox(new hitboxes[attack.hitbox](attack.hitboxParam))

        this.addTimer({duration: attack.duration, interruptable: true, callback: ()=>{
            this.switchState({newState:'chasing'})
        }})
        this.setAllow('attack', attack.cooldown)
        this.setAllow('launch', 120) //Small Delay for general smoother looking movements
    }
    
// *** End of Class ************************************************************************************************
}