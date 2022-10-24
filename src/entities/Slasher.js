import EntityBase from "./bases/EntityBase";
import createHitbox from "../system/HitboxGenerator";
import hitboxes from "../data/hitboxes/slashBlueprints";

export default class Slasher extends EntityBase{
    constructor(config,props){
        super(config,props)

        //Base Config
        this.hp = 150
        this.maxhp = this.hp
        this.baseMove = 150 * (1+Math.random()/5)
        this.launchX = 1000,
        this.launchY = -200,
        this.type = 'enemy'
        this.recoveryState = 'chasing'

        this.animations = {
            idle: "droid-default_idle",
            move: "droid-default_walk",
            attack: "droid-default_attack"
        }

        //misc
        this.windupSprite = "droid-default_attack"
        this.playerDirection;

        this.slashSprite = World.add.sprite(0,0,'slash-SlashV5').setVisible(false).setTintFill('0xf21351')
        this.add([this.slashSprite])

        World.updateEvents.push(this.AInew)
        
        //Sprite Initialisation
        this.sprite.play(this.animations.idle);
        this.body.setSize(32, 50, true);
        this.setSize(32, 50, true);
        this.initHealthbar()
        

        //AI Ranges
        this.chaseRange = 2000
        this.attackRange = 60
        this.launchRange = 200
        this.aggroRange = 300
        this.callRange = 300

        this.stepDuration = 30
        this.stepInc = 0

        //Cooldowns
        this.launchCD = 180
        this.attackCD = 180
        
        this.attacks = {
            closeAttack: {
                animation: this.animations.attack,
                hitbox: 'BasicSlash',
                scaleX: 0.8,
                scaleY: 0.1,
                windup: 20,
                state:'attacking',
                cooldown: 60,
                duration: 20,
                hitboxParam: {
                   ignore: {type : 'enemy'},
                   flipSensitive: true,
                   user: this,
                   height: 32,
                   width: 80,
                    attack:{
                        power: 30,
                        knockback: 5,
                        penetration: 20
                    }
                }
            },
            launchAttack: {
                animation: this.animations.attack,
                hitbox: 'BasicSlash',
                scaleX: 1,
                scaleY: 0.2,
                windup: 20,
                state:'launching',
                cooldown: 90,
                duration: 15,
                onStartup: ()=>{
                    this.setAllow('stateChange', 15)
                    this.body.setVelocityX(this.launchX*this.direction)
                },
                hitboxParam: {
                    user: this,
                    ignore: {type : 'enemy'},
                    height: 32,
                    width: 64,
                    duration: 15,
                    attack:{
                        power: 30,
                        knockback: 5,
                        penetration: 30
                    }
                },
            },
        }

        //Flags
        this.allow = {
            stateChange: true,
            launch: true,
            attack:true,
            launchAttack: true
        }

        
//-------------------- Idle -------------------------------------------------------------------------
        this.state.idle = {
            key: 'idle',
            idle:{},
            events: () => {
                if(this.body.velocity.x == 0){
                    if(this.sprite.anims.currentAnim.key != this.animations.idle || !this.sprite.anims.isPlaying)
                this.sprite.play(this.animations.idle)};
            },
            links: [{
                newState: 'chasing',
                weight: () => {
                    if(this.playerDis < this.aggroRange)
                    return true; else return 0;
                }, 
                action: this.aggro
            }]
        }
//-------------------- Chasing -------------------------------------------------------------------------
        this.state.chasing = {
            key: 'chasing',
            events: () => {
                if(player.x > this.x && this.playerDis > this.attackRange) this.body.setVelocityX(this.baseMove)
                else if (player.x < this.x && this.playerDis > this.attackRange) this.body.setVelocityX(-this.baseMove)
                else this.body.setVelocityX(0)

                //Animation
                if(this.body.velocity.x != 0){
                    if(this.sprite.anims.currentAnim.key != this.animations.move || !this.sprite.anims.isPlaying)
                    this.sprite.play(this.animations.move);
                }
                else{
                    if(this.sprite.anims.currentAnim.key != this.animations.idle || !this.sprite.anims.isPlaying)
                    this.sprite.play(this.animations.idle);
                }
            },
            links: [{
                newState: 'windup', //Close Attack
                weight: () => {
                    if(this.playerDis < this.attackRange && this.allow.attack)
                    return true; else return 0;
                },
                action: () => { 
                    if(this.x < player.x) this.sprite.flipX = false
                    else this.sprite.flipX = true
                    this.addTimer({duration: this.attacks.closeAttack.windup, interruptable: true, callback:()=>{
                        this.allow.atttack = false
                        this.attack(this.attacks.closeAttack); 
                    }}) 
                    //Sprite Flashing
                    this.windupSprite = this.animations.attack
                    this.flash(this.attacks.closeAttack.windup)
                    }
            },
            {
                //Currently deactivated
                newState: 'launching', //Launchjump
                weight: () => {
                    if(this.playerDis > this.launchRange && this.allow.launch ) return 0 
                    else return 0
                },
                action: () => {
                    this.setAllow('launch', this.launchCD)
                    this.setAllow('stateChange', 1)

                    if(this.x > player.x) this.direction = -1
                    else this.direction = 1
                    this.y -= 25
                    this.body.setVelocity(this.launchX*this.direction, this.launchY)
                }
            },{
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
                    this.windupSprite = this.animations.attack
                    this.tweens.flashing.resume()
                    this.addTimer({duration: this.attacks.launchAttack.windup, interruptable: false, callback: ()=>{
                        this.tweens.flashing.pause()
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
        }
    
    //-------------------- Windup --------------------------------------------------------------------------
    this.state.windup = {
        key: 'windup',
        events: ()=> {
            this.body.setVelocityX(0)
            this.sprite.setTexture(this.windupSprite)
        },
        links:[]
        
    }
    //-------------------- Launching -------------------------------------------------------------------------
    this.state.launching = {
        key: 'launching',
        events: () => {
        },
        links: [{
            newState:'chasing',
            weight: () => {if(this.body.blocked.down && this.allow.stateChange)return true; else return 0}
        }]
    }
    //-------------------- Attacking -------------------------------------------------------------------------
    this.state.attacking = {
        key: 'attacking',
        events:()=>{},
        links:[]
        }
        
    

    this.states = []
    Object.keys(this.state).forEach(key =>{
        this.states.push(this.state[key])
    })
    // *** End of Constructor ******************************************************************************************
}
genEvents(){
        this.playerDis = Phaser.Math.Distance.BetweenPoints(this,player)
    }
    genFollowEvents(){
        if(this.body.velocity.x < 0 && this.currentState != 'stunned') this.sprite.flipX = true
        else if(this.body.velocity.x > 0 && this.currentState != 'stunned') this.sprite.flipX = false

        if(this.sprite.anims.currentAnim.key == this.animations.move){
            this.stepInc++
            if(this.stepInc >= this.stepDuration){
                this.stepInc = 0
                Audio.playSE(this,'stepMetal',{range:300})
            }
        } else this.stepInc = 0
    }
    attack(attack){
        this.switchState({newState: attack.state})

        if(attack.onStartup) attack.onStartup()

        this.sprite.play(attack.animation);
        this.slashSprite.scaleX = attack.scaleY
        this.slashSprite.scaleY = attack.scaleX

        World.time.delayedCall(10*frame, function(){
            this.playSlashAnim('slash-SlashV5', 0, 10)
            Audio.playSE(this,'swing',{range:1000, maxVolume:0.05})
            createHitbox(new hitboxes[attack.hitbox](attack.hitboxParam))

        },null,this)

        this.addTimer({duration: attack.duration, interruptable: true, callback: ()=>{
            this.switchState({newState:'chasing'})
        }})
        this.setAllow('attack', attack.cooldown)
        this.setAllow('launch', 120) //Small Delay for general smoother looking movements
    }
    
// *** End of Class ************************************************************************************************
}