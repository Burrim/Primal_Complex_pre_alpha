


import EntityBase from './bases/EntityBase'
import PlayerStates from './PlayerStates'
import hitlag from '../system/hitlag';

export default class Player extends PlayerStates {
    constructor(config,props){
        super(config,props); //passes default values for sprite generating down
        
        this.type = 'player'
        
        //--- Sprite -------------------
        this.sprite = World.add.sprite(0,0,'alphaCharacter-Idle').setPipeline('Light2D')
        this.slashSprite = World.add.sprite(0,0,'slash-SlashV5').setVisible(false).setTintFill('0xf21351')
        this.shieldSprite = World.add.sprite(0,0,'particle-Shield').setVisible(false).setTintFill('0xf21351')
        this.shieldbar = World.add.rectangle(-32, 40, 64, 8, 0xff0000).setOrigin(0).setVisible(false); 
        this.shieldbarBorder = World.add.rectangle(-32, 0, 64, 8).setStrokeStyle(1, 0x000000).setOrigin(0).setVisible(false);
        this.add([this.sprite, this.slashSprite, this.shieldSprite, this.shieldbar])
        this.sprite.play("alphaCharacter-Idle");

        
        
        //Changes Hitbox
        this.body.setSize(32, 48, true);
        this.setSize(32,48)
        this.shieldSprite.setDisplaySize(96,96)

        this.body.maxSpeed = 3000

        //--- Attributes -----------------
        this.hp = 100
        this.maxhp = this.hp
        this.maxExtraLives = 0
        this.extraLives = this.maxExtraLives

        this.energy = 1000
        this.energyRegen = 2
        this.maxenergy = 1000

        this.blockEnergy = 100
        this.blockRegen = 0.1
        this.maxBlockEnergy = 100
        this.isBlocking = false
        this.perfectblock = false
        this.currentFallSpeed = 0


        this.baseMove = 500
        this.airMove = 100 
        this.baseJump = 500
        this.dashSpeed = 1000
        this.stepDuration = 30
        this.stepInc = 0

        this.maxExtraJump = 1
        this.extraJump = 1
        this.airDirection = 1

        this.walljumpCD = 15;
        this.dashCD = 60
        this.dashLength = 15

       this.disableHealthbar = true

        // --- Permission Flags ----------------
        this.allow = {
            move:true,
            passDown:false,
            dash:true,
            block:true,
            damage:true
        }

        //Adds Misc Config Data
        Object.keys(config).forEach(key => {
            this[key] = config[key]
        })
      
        // --- Init ------------------------------------
        this.init()
        World.updateEvents.push(this.AInew)

        //--- Add Loadout ------------------------------
        this.weapon = {}
        this.fireArm = []
        this.techniques = []

        // --- Generic Links  --------------------------

        this.links = {
            block: {
                newState: 'blocking',
                weight: () => {if(Input.blockTrigger()) return true; else return 0},
                action: () => {
                    Audio.playSE(this,'shield',{global:true})
                    this.body.setVelocity(0)
                    this.defense = 100
                    this.isBlocking = true
                    this.shieldSprite.setVisible(true)

                    this.perfectBlock = true
                    this.addTimer({interruptable:false, duration: 5, callback: ()=> {this.perfectBlock = false}})
                    
                }
            }
        }

        // --- State Maschine --------------------------
        this.states = []
        Object.keys(this.state).forEach(key =>{
        this.states.push(this.state[key])
    })

    //End of Constructor
    }

    init(){
    }

    genEvents(){
        this.checkTiles()

        //Charges Energy back up
        this.energy += this.energyRegen
        if(this.energy > this.maxenergy) this.energy = this.maxenergy

        //Charges Shield Energy back up
        if(this.state != 'blocking')
        this.blockEnergy += this.blockRegen
        if(this.blockEnergy > this.maxBlockEnergy) this.blockEnergy = this.maxBlockEnergy

        this.fireArm.forEach(fireArm => fireArm.update())
    }

    genFollowEvents(){

        if(this.currentState != 'crouching') this.body.setSize(32, 48, true);

        if(this.sprite.anims.currentAnim.key == 'alphaCharacter-Run'){
            this.stepInc++
            if(this.stepInc >= this.stepDuration){
                this.stepInc = 0
                Audio.playSE(this,'step',{global:true})
            }
        } else this.stepInc = 0

        if(this.body.velocity.x < 0 && this.currentState != 'stunned' && this.currentState != 'attacking' && this.currentState != 'blocking') this.sprite.flipX = true
        else if(this.body.velocity.x > 0 && this.currentState != 'stunned' && this.currentState != 'attacking' && this.currentState != 'blocking') this.sprite.flipX = false
    }

    takeDamage(damage){
        if(!this.allow.damage) return
        this.setAllow('damage',30)
        while(damage >= this.hp && this.extraLives > 0){
            this.extraLives--;
            this.hp += this.maxhp
            HUD.renderExtraLives()
        }
        
        if(damage > 0){
            hitlag(2,15)
            World.cameras.main.shake(10*frame, 0.02);
        }

        this.hp -= damage
        if(this.hp <= 0) this.die()
    }

    onDeath(){
        //HUD.healthbar.setVisible(false)
        //HUD.healthMarker.setVisible(false)
        HUD.loading.setVisible(true)
        World.enemies.forEach(enemy =>{
            enemy.active = false
        })
        World.time.delayedCall(90*frame, function(){
            World.scene.restart('World')
        },null,this)
    }

    blockHitInteraction(){
        if(this.blockEnergy <= 0) return

        Audio.playSE(this,'deflect',{global:true})

        this.shieldbar.setSize(64*this.blockEnergy/this.maxBlockEnergy, 4).setVisible(true)
        this.shieldbarBorder.setVisible(true)
        if(this.getTimer('vanishShieldbar')) this.getTimer('vanishShieldbar').deactivate()
        this.addTimer({key: 'vanishShieldbar', duration: 90, interruptable: false, callback: ()=> {
            this.shieldbar.setVisible(false)
            this.shieldbarBorder.setVisible(false)
        }})
    }

    blockBreak(){
        this.blockEnergy = 0;
        Audio.playSE(this,'shieldBreak',{global:true})
        this.setAllow('block', 420)
        particles.explosion_small.emit(this.x,this.y)
    }

    move(direction){
        this.state = 'moving'
        this.body.setVelocityX(this.baseMove * direction)
        if(this.sprite.anims.currentAnim.key != "alphaCharacter-Run" || !this.sprite.anims.isPlaying)
        this.sprite.play("alphaCharacter-Run");
    }
    
    dash(air){
        if(!this.allow.dash) return
        this.sprite.setVisible(false)

        this.indestructible = true

        this.allow.dash = false;
        this.addTimer({duration:this.dashCD, interruptable:false, callback:()=>{this.allow.dash = true}})

        this.addTimer({target:this, key: 'dashEnd', duration: this.dashLength, callback: ()=>{
            this.switchState({newState:'airborn', action: ()=>{
                this.body.allowGravity = true
                this.sprite.setVisible(true)
                this.indestructible = false
            }})
        }})
    }
    shoot(){

        if(Input.shootTrigger()) this.fireArm[0].trigger()
    }
    
}