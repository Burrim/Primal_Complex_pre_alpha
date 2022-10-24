    
import Phaser from 'phaser'

export default class EntityBase extends Phaser.GameObjects.Container{
    constructor(init,props){
        super(init.scene, init.x, init.y);

        this.id = assignId()
        
        this.sprite = World.add.sprite(0,0, props.sprite).setPipeline('Light2D')
        this.healthbar = World.add.rectangle(0, 0, 148, 8, 0xff6699).setOrigin(0).setVisible(false); 
        this.healthbarBorder = World.add.rectangle(0, 0, 148, 8).setStrokeStyle(1, 0x000000).setOrigin(0).setVisible(false);

        this.add([this.sprite, this.healthbar, this.healthbarBorder])

        this.hp = 1,
        this.defense = 0
        this.knockbackResistance = 0;

        this.stun = 0
        this.attackCD = 0;

        this.baseMove = 0

        this.state = 'idle'
        this.currentState = 'idle'
        this.previousState = 'idle'
        this.recoveryState = 'idle'
        this.AInew = this.AInew.bind(this)

        this.disabled = props.disabled

        this.timers = []
        this.allow = {} //Container for Flags that can temporary prohibit an action
        
        this.stateDur = 0 //Tracks how long the current State was active

        this.hitboxes = {
            circle:[],
            rectangle:[]
        }

        this.AInew = this.AInew.bind(this)
        //World.updateEvents.push(this.AInew)

        World.physics.world.enable(this);
        World.add.existing(this);

        this.tweens = {
            flashing: World.tweens.addCounter({
                from: 255,
                to: 0,
                duration: 300,
                yoyo: true,
                loop: -1,
                paused:true,
                onUpdate:  (tween)=>{
                    const value = Math.floor(tween.getValue());
                    this.sprite.setTint(Phaser.Display.Color.GetColor(255, value, value));
                }
            })
        }

        this.state = {
            stunned:{
                key:'stunned',
                events: () => {
                    this.body.setVelocityX(this.body.velocity.x * (this.stun-1) / this.stun  )
                    this.body.setVelocityY(this.body.velocity.y * (this.stun-1) / this.stun  )
                },
                links:[]
            }
        }
    // ***** End of Constructor ******************************************************************************************************************
    }
    takeDamage(damage){
        this.hp -= damage
        this.updateHealthbar()
        if(this.hp <= 0) this.die()
    }

    die(){
        if(this.onDeath != undefined) this.onDeath()
        this.setActive(false).setVisible(false)
        this.body.enable = false
        if(this.type == 'enemy')particles.wraithEmerge.emit(this.x,this.y)
    }

    blockHit(damage){
        if(this.perfectBlock && damage > this.maxBlockEnergy) this.perfectBlock = false //Disables perfect Block when incoming attack is too strong
        if(!this.perfectBlock) this.blockEnergy -= damage
        if(this.blockHitInteraction) this.blockHitInteraction()
        if(this.blockEnergy <= 0) this.blockBreak()
        if(this.shieldSprite){
            this.shieldSprite.setTint('0xffffff')
            this.addTimer({target: this, key:'shieldflash', interruptable: false, duration: 5, callback: () => {
            this.shieldSprite.setTint('0xf21351')
        }})
        }  
    }

    blockBreak(){
        this.isBlocking = false
        this.defense = 0   
        if(this.shieldSprite)  this.shieldSprite.setVisible(false)
    }

    AInew(){
        if(!this.active) return
        if(this.disabled) return

        //Events Before State Machine
        if(this.genEvents) this.genEvents()

        //Custom made Switch Case that executes current state 
        for(let i = 0; i < this.states.length; i++)
        {
            if(this.currentState === this.states[i].key)
            {
                //Execute State Events
                if(this.states[i].events)
                this.states[i].events()
                this.stateDur++;

                //Calculates if and which state should be changed to 
                this.states[i].totWeight = 0
                for(let j = 0; j < this.states[i].links.length; j++){

                    //Aborts calculations and immediately switches states if weightvalue returned true
                    if(this.states[i].links[j].weight() == true){
                        this.switchState(this.states[i].links[j])
                        break;
                    }
                    //Adds Weight Value of each Links
                    this.states[i].totWeight += this.states[i].links[j].weight()
                }

                //If no link has a chance to fire, end process
                if(this.states[i].totWeight === 0){
                    if(this.genFollowEvents) this.genFollowEvents()
                    break
                }

                //Checks for links that are allowed to fire relative to their weight
                let rng = Math.floor(Math.random()*this.states[i].totWeight)
                let cnt = 0
                for(let j = 0; j < this.states[i].links.length; j++){
                    let weight = this.states[i].links[j].weight()
                    //Executes stateswitch immediately if conditions are met
                    if(rng < weight + cnt){
                    this.switchState(this.states[i].links[j])
                    break;
                  }
                  else cnt += weight //cnt is used to allow a relative calculation for the next link
                } 
            }
        }
        if(this.genFollowEvents) this.genFollowEvents()

    }

    switchState(link){


        this.previousState = this.currentState

        this.currentState = link.newState

        //Deactivats all interruptable timers
        this.timers.forEach((timer,index) => {
            if(timer.interruptable)
            timer.deactivate()
            if(timer.recycle)
            this.timers.slice(index,1)
        })
        //Executes Action associated with link if there is any
        if(link.action) link.action(link.props)

        try {
            
        } catch (error) { //Not every entity supports the new system and could crash with this line
            if(this.state[link.newState].onEnter) this.state[link.newState].onEnter()
        }
        

        if(this.previousState != link.newState) this.stateDur = 0;
    }

    addTimer(config){
        let timer = {
            key : config.key,
            interruptable: config.interruptable, //Clears Timer on statechange when true
            recycle: false, //Marks the object so it can be overwritten
            main : World.time.delayedCall(
                config.duration*frame, 
                function(){ 
                    config.callback(); 
                    timer.deactivate()
                },
                null, this),
            deactivate : function(){ World.time.removeEvent(this.main); this.recycle = true;},
        }
        this.timers.push(timer)
        return timer
    }
    getTimer(key){
        let output
        for(let i = 0; i < this.timers.length; i++){
            if(this.timers[i].key == key && !this.timers[i].recycle){
                output = this.timers[i]
                break;
            }
        }
        return output
    }

    aggro(){ //Aggroes nearby Enemies
        World.enemies.forEach(enemy => {
            if(!enemy.active) return;
            if(Phaser.Math.Distance.BetweenPoints(this,enemy) <= this.callRange)
            enemy.switchState({newState:'combat'})
        });
    }
    flash(duration){ //Initiates Sprite Flashing 
        this.tweens.flashing.resume()
        this.addTimer({duration: duration, interruptable: false, callback: ()=>{
            this.tweens.flashing.pause()
            this.sprite.setTint('0xFF0000')
        }})
    }
    setAllow(key, dur, noClear){
            this.allow[key] = false

            //Disables Previous Timer if clear flag is set
            let fetch = this.getTimer('setAllow-'+key)
            if(!noClear && fetch != undefined) {fetch.deactivate()}

            //If duration is given as Zero deletes all running timers without starting a new one
            if(dur > 0)
            this.addTimer({key:'setAllow-'+key, duration: dur, interruptable: false, callback:()=>{this.allow[key] = true; }})
       
    }
    playSlashAnim(key, orientation, duration){
        this.slashSprite.setVisible(true)
        this.slashSprite.play(key)
        if(orientation == 0) this.slashSprite.flipY = this.sprite.flipX
        else this.slashSprite.flipY = false
        this.slashSprite.setAngle(orientation + 90)
        this.slashTimer = World.time.delayedCall(duration*frame, function(){
            this.slashSprite.setVisible(false)
            this.slashSprite.scaleX = 1
            this.slashSprite.scaleY = 1
        }, null, this)
    }
    initHealthbar(){
        this.healthbar.setSize(this.width*1.5, 4)
        this.healthbarBorder.setSize(this.width*1.5, 4)
        this.healthbar.setPosition(-this.width/2, -(this.height/2 + 8) )
        this.healthbarBorder.setPosition(-this.width/2, -(this.height/2 + 8) )
    }
    updateHealthbar(){
        if(this.disableHealthbar) return
        this.healthbar.setSize(this.width*1.5*this.hp/this.maxhp, 4).setVisible(true)
        this.healthbarBorder.setVisible(true)
        if(this.getTimer('vanishHealthbar')) this.getTimer('vanishHealthbar').deactivate()
        this.addTimer({key: 'vanishHealthbar', duration: 180, interruptable: false, callback: ()=> {
            this.healthbar.setVisible(false)
            this.healthbarBorder.setVisible(false)
        }})
    }

    checkTiles(){
        this.touchingTiles = {
            left: World.map.core.getTileAtWorldXY(this.x-(this.body.width+2), this.y, true, World.cameras.main, 'meta'),
            right: World.map.core.getTileAtWorldXY(this.x+(this.body.width+2), this.y, true, World.cameras.main, 'meta'),
            down: World.map.core.getTileAtWorldXY(this.x, this.y+(this.body.height+2), true, World.cameras.main, 'meta'),
            up: World.map.core.getTileAtWorldXY(this.x, this.y-(this.body.height+2), true, World.cameras.main, 'meta')
        }
    }
//End of Class *******************************************************************************************************************
}