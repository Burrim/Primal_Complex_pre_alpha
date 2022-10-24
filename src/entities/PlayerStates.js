import getInteractable from '../system/getInteractable';
import EntityBase from './bases/EntityBase'

export default class PlayerStates extends EntityBase{
    constructor(config,props){
        super(config,props); //passes default values for sprite generating down

// *** Links  ************************************************************************************************************************************************************************

    this.links = {
        block: {
            newState: 'blocking',
            weight: () => {if(Input.blockTrigger() && this.allow.block) return true; else return 0},
            action: () => {
                Audio.playSE(this,'shield',{global:true})
                this.body.setVelocity(0)
                this.defense = 100
                this.isBlocking = true
                this.shieldSprite.setVisible(true)

                this.knockbackResistance = 100

                this.perfectBlock = true
                this.addTimer({interruptable:false, duration: 5, callback: ()=> {this.perfectBlock = false}})
                
            }
        },
        blockEnd: {
            newState : 'idle',
            weight: ()=> {if(!Input.blockHold())return true; else return 0},
            action: ()=> {
                if(Input.buffer.key == 'blockHold') Input.buffer = {}
                this.defense = 0
                this.isBlocking = false
                this.knockbackResistance = 0
                this.shieldSprite.setVisible(false)
            }
        },
        dashWindup:{
            newState: 'dashWindup',
            weight: () => {if(Input.dashTrigger() && this.allow.dash) return true; else return 0},
        },
        dash: {
            newState: 'dashing',
            weight: () => {if(this.stateDur >= 2) return true; else return 0},
            action: () => {
                this.dash(false); 
                Audio.playSE(this,'dash',{global:true})

            }  
        },
        attack: {
            newState: 'attacking',
            weight: () => {if((Input.attackTrigger() || Input.secActive()) && !getInteractable()) return true; else return 0},
            action: () => {
                if(this.previousState == 'airborn'|| this.previousState == 'wallsliding')
                this.weapon.airAttack()
                else this.weapon.attack()
            }
        },
        technique: {
            newState: 'attacking',
            weight: () => {if(Input.special1Trigger() || Input.special2Trigger()) return true; else return 0},
            action: () => {
                if(Input.special1Trigger()) this.techniques[0].attack()
                else if (Input.special2Trigger()) this.techniques[1].attack()
            }
        },
        jumpSquat: {
            newState: 'jumpsquat',
            weight: () => { if(Input.jumpTrigger()) return true; else return 0},
            action: () => {
                
                if(!this.sprite.flipX)particles.dust_left_small.emit(this.x,this.y+32)
                else if(!this.sprite.flipX) particles.dust_right_small.emit(this.x,this.y+32)     
            }
        },
        jump: {
            newState: 'airborn',
            weight: () => {{if(!Input.jumpHold() || this.stateDur >= 5) return true; else return 0}},
            action: () => {

                if(this.stateDur >= 5)
                this.body.setVelocityY(-this.baseJump)
                else this.body.setVelocityY(-this.baseJump/1.5)

                this.sprite.play("alphaCharacter-Jump");
                Audio.playSE(this,'jump',{global:true})

            }
        },
        plattformDrop: {
            newState: 'airborn',
            weight: () => {
                if(this.touchingTiles.down.properties.passDown && Input.downHold() && this.allow.passDown && !this.touchingTiles.down.noDrop) 
                return true; else return 0
            },
            action: () => {
                this.y += 50,
                this.allow.passDown = false
                
            } 
        },
        crouch: {
            newState: 'crouching',
            weight: () => {if(Input.downHold()) return true; else return 0},
            action: ()=>{
                this.body.setSize(32, 48, true);
                //this.y+= 6
            }
        },
        fallOff: {
            newState: 'airborn',
            weight: () => {
                if(!(this.body.blocked.down || this.touchingTiles.left.canCollide || this.touchingTiles.right.canCollide 
                || this.currentState == 'dashing' && Input.dashHold()) || ((this.touchingTiles.left.noJump || this.touchingTiles.right.noJump ) && this.currentState != 'idle'))

                return true; else return 0
            },
            action: () => {
                this.indestructible = false
            }
        },
        standUp: {
            newState: 'idle',
            weight: () => {{if(!Input.downHold()) return true; else return 0}},
            action: () => {
                //If The Player presses down again shortly after crouching he gains the ability to drop trough passDown Plattforms.
                this.allow.passDown = true; 
                this.addTimer({target: this, key:'plattformDrop', duration: 15, interruptable:true,callback:()=>{this.allow.passDown = false} })
            }
        },
        landing: {
            newState: 'idle',
            weight: () => {if(this.body.blocked.down && !(this.currentState == 'dashing' && Input.dashHold()) && this.currentFallSpeed <= 2000) return true; else return 0},
            action: () => {
                this.indestructible = false 
                Audio.playSE(this,'step',{global:true})
                if(this.currentFallSpeed > 500){
                    particles.dust_left_small.emit(this.x-16,this.y+32)
                    particles.dust_right_small.emit(this.x+16,this.y+32)
                }
                
            }
        },
        landingHard: {
            newState: 'stunned',
            weight: () => {if(this.body.blocked.down && !(this.currentState == 'dashing' && Input.dashHold()) && this.currentFallSpeed >= 2000) return true; else return 0},
            action: () => {
                 Audio.playSE(this,'step',{global:true})
                 this.switchState({
                    newState : 'stunned',
                    action: ()=> {
                        particles.dust_left_small.emit(this.x-16,this.y+32)
                        particles.dust_right_small.emit(this.x+16,this.y+32)
                        particles.dust_left_small.emit(this.x-48,this.y+16)
                        particles.dust_right_small.emit(this.x+48,this.y+16)
                        this.body.setVelocityX(0)
                        this.sprite.play("alphaCharacter-Crouch");
                        this.stun = 20
                        this.addTimer({
                            key:'knockback', 
                            interruptable: false, 
                            duration: this.stun, 
                            callback:()=>{ this.switchState({
                                newState : this.recoveryState,
                                action: ()=>{} 
                            })}})
                    }
                 })   
            }
        },
        wallslide: {
            newState: 'wallsliding',
            weight: () =>{
                if(!this.touchingTiles.left) return 0
                if((this.allow.move && this.touchingTiles.left.canCollide && !this.touchingTiles.left.noJump) || (this.touchingTiles.right.canCollide && !this.touchingTiles.right.noJump))
                return true; else return 0
            }
        },
        wallJump: {
            newState:'airborn', //Walljump
            weight: () => {if(Input.jumpTrigger(true)) return true; else return 0},
            action: () => {
                if(this.sprite.anims.currentAnim.key != "alphaCharacter-Jump" || !this.sprite.anims.isPlaying)
                this.sprite.play("alphaCharacter-Jump");
                Audio.playSE(this,'jump',{global:true})
                
                this.body.setVelocityY(-this.baseJump*1.2)
                if(this.sprite.flipX){
                    this.body.setVelocityX(this.baseJump/1.2)
                    particles.dust_left_small.emit(this.x,this.y+32)
                }
                else{
                    this.body.setVelocityX(-this.baseJump/1.2)
                    particles.dust_right_small.emit(this.x,this.y+32)
                } 

                this.allow.move = false
                this.addTimer({interruptable:false, duration: this.walljumpCD, callback: ()=> {this.allow.move = true}})
            }
        }
    }
// *** State Maschine **************************************************************************************************************************************************************
//-------------------- Idle -------------------------------------------------------------------------
    this.state.idle = {
        key: 'idle',
        events: () => {
            this.shoot()
            if(this.body.blocked.down)

            //State Specific Actions
            this.extraJump = this.maxExtraJump
            if(!this.disableRespawn && this.touchingTiles.down.canCollide && !this.touchingTiles.down.noSave) this.respawnPoint = {x:this.x,y:this.y - 16}

            //Movement
            if(Input.leftHold()){ 
                //if(this.body.velocity.x >= 0) particles.dust_left_small.emit(this.x+16,this.y+32) //Dust particle when the player starts running in this direction
                this.body.setVelocityX(-this.baseMove * Input.leftHold())
            } 
            else if (Input.rightHold()){
                //if(this.body.velocity.x <= 0) particles.dust_right_small.emit(this.x-16,this.y+32) //Dust particle when the player starts running in this direction
                this.body.setVelocityX(this.baseMove * Input.rightHold())
            } 
            else this.body.setVelocityX(0)

            //Animation
            if(this.body.velocity.x == 0){
                if(this.sprite.anims.currentAnim.key != "alphaCharacter-Idle" || !this.sprite.anims.isPlaying){
                    this.sprite.play("alphaCharacter-Idle");
                }
            } else {
                if(this.sprite.anims.currentAnim.key != "alphaCharacter-Run" || !this.sprite.anims.isPlaying){
                    this.sprite.play("alphaCharacter-Run");
                }
            }

            //Trigger Interaction
            if(Input.attackTrigger() && getInteractable()){
                getInteractable().triggerInteraction()
            }
        },
        links: [this.links.dashWindup,this.links.attack,this.links.technique,this.links.jumpSquat,this.links.plattformDrop,this.links.crouch,this.links.fallOff, this.links.block]
    }

//-------------------- Crouching -------------------------------------------------------------------------
    this.state.crouching = {
        key: 'crouching',
        events: () => {
            this.body.setVelocityX(this.body.velocity.x/1.05)
            if(this.sprite.anims.currentAnim.key != "alphaCharacter-Crouch" || !this.sprite.anims.isPlaying)
            this.sprite.play("alphaCharacter-Crouch");
            this.shoot()
        },
        links: [this.links.dashWindup,this.links.attack,this.links.technique,this.links.jumpSquat,this.links.standUp,this.links.fallOff,this.links.block]
    }
    //-------------------- Jumpsquat -------------------------------------------------------------------------
    this.state.jumpsquat = {
        key: 'jumpsquat',
        events: () => {
        },
        links: [this.links.jump]
    }
//-------------------- Airborn -------------------------------------------------------------------------
    this.state.airborn = {
        key: 'airborn',
        events: () => {

            if(this.body.velocity.y > 0)this.currentFallSpeed = this.body.velocity.y //Logs fallspeed for landing lag after a big fall

            //Airjump
            if(this.extraJump > 0 && Input.jumpTrigger(true)){
                this.extraJump--
                this.body.setVelocityY(-this.baseJump)
                Audio.playSE(this,'jump',{global:true})
            }

            //Airmovement
            if(this.allow.move){
                if(Input.rightHold()) this.body.setVelocityX(this.baseMove * Input.rightHold())
                else if(Input.leftHold()) this.body.setVelocityX(-this.baseMove * Input.leftHold())
                else this.body.velocity.x /= 1.1

                this.shoot()

            if(Input.downTrigger() && !Input.attackHold()){
                this.addTimer({target: this, key:'fastfall', interruptable: true, duration: 3, callback: () => {
                    this.body.setVelocityY(1500)
                }})
            }
            }
            //Animation
            if(this.body.velocity.y > 0){
                if(this.sprite.anims.currentAnim.key != "alphaCharacter-Fall" || !this.sprite.anims.isPlaying)
                this.sprite.play("alphaCharacter-Fall");
            } else {
                if(this.sprite.anims.currentAnim.key != "alphaCharacter-Jump" || !this.sprite.anims.isPlaying)
                this.sprite.play("alphaCharacter-Jump");
            }
        },
        links: [this.links.landing,this.links.landingHard,this.links.dashWindup,this.links.attack,this.links.technique,this.links.wallslide]
    }
//-------------------- Wallsliding -------------------------------------------------------------------------
    this.state.wallsliding = {
        key: 'wallsliding',
        events: () => {
            if(this.sprite.anims.currentAnim.key != "alphaCharacter-SlideWall" || !this.sprite.anims.isPlaying)
            this.sprite.play("alphaCharacter-SlideWall");
            if(this.allow.move){
                if(Input.leftHold()) this.body.setVelocityX(-this.baseMove)
                else if (Input.rightHold()) this.body.setVelocityX(this.baseMove)
                else this.body.velocity.x /= 1.1

                this.shoot()
            }
        },
        links : [this.links.attack,this.links.technique,this.links.fallOff, this.links.wallJump,this.links.landing]
    }
//-------------------- Dash Windup -------------------------------------------------------------------------
    this.state.dashWindup = {
        key: 'dashWindup',
        events: () => {},
        links: [this.links.dash]
    }
//-------------------- Dashing -------------------------------------------------------------------------
    this.state.dashing = {
        key: 'dashing',
        events: () => {
            this.body.allowGravity = false;
            this.body.setVelocityY(0)
            if(this.sprite.flipX){
                this.body.setVelocityX(-this.dashSpeed)
            } else {
                this.body.setVelocityX(this.dashSpeed)
            }
            if(!this.airDash){
                if(this.sprite.anims.currentAnim.key != "alphaCharacter-Run") 
                this.sprite.play("alphaCharacter-Run");
            }
            else{
                if(this.sprite.anims.currentAnim.key != "alphaCharacter-Jump") 
                this.sprite.play("alphaCharacter-Jump");
            }
            particles.dash.emit(this.x, this.y);
        },
        links: [this.links.landing, this.links.fallOff]
    },
//-------------------- Blocking --------------------------------------------------------------------------
    this.state.blocking = {
        key: 'blocking',
        events: ()=>{
            if(this.sprite.anims.currentAnim.key != "alphaCharacter-Idle" || !this.sprite.anims.isPlaying)
            this.sprite.play("alphaCharacter-Idle");
            this.body.setVelocityX(this.body.velocity.x/2)
        },
        links: [this.links.blockEnd]
    }
//-------------------- Attacking -------------------------------------------------------------------------
    this.state.attacking = {
        key: 'attacking',
        attacking : {},
        links: []
    }
//-------------------- Charging Attacks -------------------------------------------------------------------------
    this.state.attackCharging = {
        key: 'attackCharging',
        events: () => {
            this.body.setVelocityX(0)
            if(this.chargeRelease()) {
                this.switchState({newState:'attacking'})
                this.charging()
            }
        },
        links: [this.links.dashWindup]
    }
//------------------------------------------------------------------------------------------------------------------------

    } 
}

