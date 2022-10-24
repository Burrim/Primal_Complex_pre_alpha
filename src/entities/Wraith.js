import Phaser from "phaser";
import EntityBase from "./bases/EntityBase";
import createHitbox from "../system/HitboxGenerator";
import thunderStrike from "../data/hitboxes/thunderStrike"
import Orb from "./Orbs";
import reactivateInactive from "../system/reactivateInactive";

import { genericEnemyPrj } from "../data/projectiles/projectileBlueprints";
import createProjectil from "../system/ProjectilGenerator";

export default class Wraith extends EntityBase{
    constructor(config,props){
        super(config,props)
        World.wraith = this

        //Base Config
        this.hp = 2000
        this.maxhp = this.hp
        this.baseMove = 150 * (1+Math.random()/5)
        this.type = 'enemy'
        this.recoveryState = 'idle'

        this.sprite.play('wraith-idle')

        this.sprite.setVisible(false)
        this.body.allowGravity = false

        //misc
        this.playerDirection;

        World.updateEvents.push(this.AInew)
        this.teleport = this.teleport.bind(this)
        
        //Sprite Initialisation
        //this.sprite.play(this.animations.idle)
        this.body.setSize(32, 50, true);
        this.setSize(48, 50, true);
        this.initHealthbar()

        this.charged = false
        

        //AI Ranges
        this.chaseRange = 2000
        this.attackRange = 60

        this.hpValues = {
           AAFrequency:[
            {threshold:100,value:120},
            {threshold:70,value:60},
            {threshold:70,value:60},
           ],
           AACooldown:[
            {threshold:100,value:180},
            {threshold:70,value:60},
           ],
           chargeDuration:[
            {threshold:100,value:180},
            {threshold:30,value:360}
           ],
           autoAttackCount:[
            {threshold:100,value:4},
            {threshold:70,value:3},
            {threshold:30,value:1}
           ]
        }


        //Counters
        this.hitcounter = 0 //Counts the amount of hits taken. Needs to be tracked to initiate instant teleports
        this.lightningCounter = 0 //Counts the amounts of consecutive Lightning strikes

        this.orbs = []
        
        //Cooldowns
        this.attacks = {}

        //Flags
        this.allow = {
            attack:false,
            charge:false,
            cross: true
        }



// *** Links ************************************************************************************************************************

        this.links = {

// --- Transitions ----------------------------------------------------------------------------/

            startAutoAttack: {
                newState: 'autoAttack',
                weight: () => {if(this.allow.attack) return true; else return 0},
                action: () => { this.recoveryState = 'autoAttack'}
            },

            special: {
                newState: 'special',
                weight: () => {if(this.allow.charge) return true; else return 0},
                action: () => {
                    this.allow.charge = false
                    this.lightningCounter = 0

                    let timer = this.getTimer('teleport')
                    if(timer == false){
                        let newTimer = this.addTimer({
                        key:'teleport',
                        interruptable: false,
                        duration: 900,
                        callback: this.teleport
                        })
                    }
                }
            },

            charge: {
                newState: 'charging',
                weight: () => {
                    if(this.lightningCounter >= this.getHPValues('autoAttackCount')) return true
                    else return 0
                },
                action: () =>{
                    this.recoveryState = 'autoAttack'
                    this.lightningCounter = 0
                    this.setAllow('charge',this.getHPValues('chargeDuration'))
                    this.setAllow('attack',0)
                }
            },

// --- Attacks ----------------------------------------------------------------------------/

    //Phase 1 Attacks
    bigRing: {
        newState: 'idle',
        weight: () => { if(this.hp >= this.maxhp*0.3 )return 5; else return 0 },
        action: () => {
            this.spawnOrbs(100,32,300,40,280)
        }
    },
    lightningWave: {
        newState: 'idle',
        weight: () => { if(this.hp >= this.maxhp*0.3 )return 2; else return 0 },
        action: () => {
            for(let i = 0; i < 10; i++){
                this.thunderStrike({x:this.x +(i+1)*96,y:this.y},60)
                this.thunderStrike({x:this.x -(i+1)*96,y:this.y},60)
            }}
        },
    //Phase 2 Attacks
    ringWave: {
        newState: 'idle',
        weight: () => { if(this.hp <= this.maxhp*0.7 )return 2; else return 0 },
        action: () => {
            this.spawnOrbs(100,32,300,40,280)
            for(let i = 0; i < 10; i++){
                this.thunderStrike({x:this.x +(i+1)*96,y:this.y},60)
                this.thunderStrike({x:this.x -(i+1)*96,y:this.y},60)
            }}
        },
    //Phase 3 Attacks
    gearshift: {
        newState: 'idle',
        weight: () => { if(this.hp <= this.maxhp*0.3 && !this.charged )return true; else return 0 },
        action: () => {
            this.charged = true
            World.cameras.main.shake(120*frame, 0.01);
            Audio.playSE(this,'gearshift',{global:true})
            World.setLights('finale',{color:0xf21351})

            this.addTimer({duration:120,interruptable:false,callback:()=>{
                Audio.playBGM('BossFinale')
                this.laser()
            }})
            
        }
    },  
    crossBlast: {
        newState: 'idle',
        weight: () => { if(this.hp <= this.maxhp*0.3 )return 3; else return 0 },
        action: () => {
            this.laser()
        }
    },
    doubleCrossBlast: {
        newState: 'idle',
        weight: () => { if(this.hp <= this.maxhp*0.3 )return 2; else return 0 },
        action: () => {
            this.laser()
            this.addTimer({duration:120,interruptable:false,callback:()=>{this.laser()}})
        }
    },
    ringBlast: {
        newState: 'idle',
        weight: () => { if(this.hp <= this.maxhp*0.3 )return 3; else return 0 },
        action: () => {
            this.laser()
            this.spawnOrbs(100,32,300,40,280)
        }
    },
    }
    
// *** States ************************************************************************************************************************

//-------------------- Idle -------------------------------------------------------------------------

        this.state = {}
        this.state.idle = {
            key: 'idle',
            idle:{},
            onEnter: () =>{
                this.setAllow('attack',this.getHPValues('AACooldown'))
                this.recoveryState = 'idle'
            },
            events: () => {
                //if(!World.activeBoss) World.startBossCamera(this)

                if(Input.trigger.keyboard['0']) {
                    for(let i = 0; i < 10; i++){
                        this.thunderStrike({x:this.x +(i+1)*96,y:this.y})
                        this.thunderStrike({x:this.x -(i+1)*96,y:this.y})
                    }
                }
                if(Input.trigger.keyboard['9']) this.thunderStrike(player) //Single Target Strike
                if(Input.trigger.keyboard['8']) this.spawnOrbs(76,6,200,150,1000) //Small Orb Ring 
                if(Input.trigger.keyboard['7']) this.spawnOrbs(100,16,300,40,560) //Extending Orb Ring 
                if(Input.trigger.keyboard['6']) this.teleport()
                
                
            },
            links: [this.links.special,this.links.charge,this.links.startAutoAttack]
        }

//-------------------- Auto Attack -------------------------------------------------------------------------

        this.state.autoAttack = {
            key:'autoAttack',
            events: ()=> {
                if(this.allow.attack){
                    this.thunderStrike(player,60)
                    this.lightningCounter++
                    this.setAllow('attack',this.getHPValues('AAFrequency'))
                }
            },
            links:[this.links.charge]
        }

//-------------------- Charging -------------------------------------------------------------------------

        this.state.charging = {
            key:'charging',
            events: ()=>{
                particles.enemyCharge.emit(this.x,this.y)
            },
            links:[this.links.special]
        }

//-------------------- Special -------------------------------------------------------------------------

        this.state.special = {
            key:'special',
            events: () => {},
            links:[this.links.lightningWave,this.links.bigRing,this.links.crossBlast,this.links.doubleCrossBlast,this.links.gearshift,this.links.ringBlast,this.links.ringWave]
        }

//-------------------- Stunned -------------------------------------------------------------------------

        this.state.stunned = {
            key:'stunned',
            events: () => {
                this.body.allowGravity = true;
                this.body.setVelocityX(this.body.velocity.x * (this.stun-1) / this.stun  )
                this.body.setVelocityY(this.body.velocity.y * (this.stun-1) / this.stun  )
            },
            links:[]
        }
        
    

    this.states = []
    Object.keys(this.state).forEach(key =>{
        this.states.push(this.state[key])
    })

// *** End of Constructor ************************************************************************************************************************
}
genEvents(){
        this.playerDis = Phaser.Math.Distance.BetweenPoints(this,player)
        this.checkTiles()
        if(this.currentState != 'stunned') this.levitate()
        this.orbs.forEach(orb =>{
            orb.move()
        })

        if(this.getTimer('setAllow-attack') == undefined && !this.allow.attack ){
            this.setAllow('attack',this.getHPValues('AACooldown'))
        } 
    }

takeDamage(damage){
    this.hp -= damage
    this.updateHealthbar()

    this.hitcounter++
    //If not yet present creates a timer that initiates a teleport after a few seconds even if the player stops attacking the wraith
    let timer = this.getTimer('teleport')
    if(timer == false){
        let newTimer = this.addTimer({
            key:'teleport',
            interruptable: false,
            duration: (Math.random()+1)*180,
            callback: this.teleport
        })
    }

    //If not yet present starts a timer for attack ready
    

    if(this.hp <= 0) this.die()

    //Teleports away when taken enough hits
    if(this.hitcounter >= 4){
        this.teleport()
    }
}

onDeath(){

    localStorage.setItem(selectedMap+'-completed',true)
    //Start Endscreen
    World.redScreen = World.add.rectangle(player.x,player.y,1600,800,0xf21351).setOrigin(0.5).setAlpha(0).setDepth(10)
    World.cameras.main.shake(600*frame, 0.01);

    World.updateEvents.push(World.gameFinishUpdate)
    
    HUD.fade()
    World.tweens.add({
        targets:World.redScreen,
        alpha: 1,
        duration: 300*frame,
    })
        
    World.tweens.add({
        targets:  Audio.BGM.BossFinale.src,
        volume:   0,
        duration: 600*frame
    });
    
    //After Screen turned Red
    World.time.delayedCall(600*frame,()=>{ 
        
        World.cameras.main.fadeOut(500*frame, 0, 0, 0)

        player.active = false
        player.sprite.setVisible(false)
        player.body.allowGravity = false
        player.setPosition(3814,2834)

        Audio.BGM.Wind.src.setVolume(0)
            Audio.playBGM('Wind')
            World.tweens.add({
            targets:  Audio.currentBGM,
            volume:   0.3,
            duration: 600*frame
            });

        //After Screen turned to black
        World.time.delayedCall(1000*frame,()=>{
            
            World.redScreen.setVisible(false)
            let dummy = {size:3000}
            World.tweens.add({
                targets: dummy,
                size: 1000,
                repeat:-1,
                yoyo: true,
                duration: 320*frame,
                ease: 'Linear',
                onUpdate: function(){
                    World.setLights('endScreen',{radius:dummy.size})
                }
            })

            

            World.cameras.main.fadeIn(500*frame, 0, 0, 0)

                //After Ending Scene has etablished and some time has passed
                World.time.delayedCall(400*frame,()=>{
                    HUD.tweens.add({
                        targets:HUD.thankyou,
                            alpha: 1,
                            duration: 400*frame,
                        })
                },null,HUD)

        },null,World)


    },null,World)

    
    

}



// *** Actions ***********************************************************************************************************


thunderStrike(target,delay){
    //Traces target coordinate and rounds it to the next full tile value on top of a valid floor tile
    let targetPos = {
        x: target.x,
        y: target.y - target.y % 32
    }
    while(!World.map.core.getTileAtWorldXY(targetPos.x, targetPos.y, true, World.cameras.main, 'meta').canCollide){
        targetPos.y += 32
        if(targetPos.y - target.y >= 360) break;
    }
    if(targetPos.y - target.y >= 360) return //Cancels attack if player is too high up in the air



    particles.targetFloor.emit(targetPos.x,targetPos.y)
    this.addTimer({
        key:'thunderstrike',
        interruptable: false,
        duration: delay,
        callback: ()=> {
            createHitbox(new thunderStrike({
                x:targetPos.x,
                y:targetPos.y
            }))
            particles.lightningStrike.emit(targetPos.x,targetPos.y)
            Audio.playSE(this,'lightningStrike',{global:true})
        }
    })
}

spawnOrbs(radius,amount,speed,turnSpeed,duration){
    let values = []

    Audio.playSE(this,'orbs',{global:true})

    for(let i = 0; i < amount; i++){
        let val = {}
        val.angle = + i*(360/amount)
        val.position = World.physics.velocityFromAngle(val.angle-90, radius);
        values.push(val)
    }

    values.forEach(value => {
        let orb = reactivateInactive(World.orbs,this.x+value.position.x,this.y+value.position.y,"orb")
        if(orb){
            orb.speed = speed
            orb.turnSpeed = turnSpeed
            orb.body.setAngularVelocity(turnSpeed);
            orb.setRotation(Phaser.Math.DegToRad(value.angle))
            if(duration != undefined)  World.time.delayedCall(duration*frame,orb.die,null,orb)
        }
        else{
            orb = new Orb(this.x+value.position.x,this.y+value.position.y,speed,turnSpeed,value.angle,duration)
            World.orbs.push(orb)
            this.orbs.push(orb)
        }            
    })
}

laser(){
    //Only one crossmaerker can be actie at one time. If the wraith wants to trigger a second one to soon after the first a delayed ring will be generated instead
    if(!this.allow.cross){
        this.addTimer({duration:90,interruptable:false,callback:()=>{
            this.spawnOrbs(100,32,300,40,280)
        }})
    }
    this.setAllow('cross',2500/frame)

    let config = {
        x:this.x,
        y:this.y,
        angle:Math.random()*360
    }

    this.body.allowGravity = false
    this.knockbackResistance = 100
    particles.wraithLaserMarker.emitter.Cross.rotate.propertyValue = config.angle
    particles.wraithLaserMarker.emit(config.x,config.y)

    this.addTimer({duration:90,interruptable:false,callback:()=>{
        particles.wraithLaser.emit(config.x,config.y,{angle:config.angle})
        particles.wraithLaser.emit(config.x,config.y,{angle:config.angle+90})
        particles.wraithLaser.emit(config.x,config.y,{angle:config.angle+180})
        particles.wraithLaser.emit(config.x,config.y,{angle:config.angle+270})

        createProjectil(new genericEnemyPrj(this,{angle:Phaser.Math.DegToRad(config.angle),speed:2000,radius:30,phase:true,alpha:0.0001}))
        createProjectil(new genericEnemyPrj(this,{angle:Phaser.Math.DegToRad(config.angle+90),speed:2000,radius:30,phase:true,alpha:0.0001}))
        createProjectil(new genericEnemyPrj(this,{angle:Phaser.Math.DegToRad(config.angle+180),speed:2000,radius:30,phase:true,alpha:0.0001}))
        createProjectil(new genericEnemyPrj(this,{angle:Phaser.Math.DegToRad(config.angle+270),speed:2000,radius:30,phase:true,alpha:0.0001}))

        Audio.playSE(this,'wraithLaser',{global:true})
        
        this.body.allowGravity = true
        this.knockbackResistance = 0
    }})




}


teleport(){
    //Resets any restover Timer as well as their activation requirements
    this.hitcounter = 0
    let timer = this.getTimer('teleport')
    if(timer != undefined) timer.deactivate()

    //Searches for a spawn point sufficiently far away
    while(true){
        let target = World.wraithTPs[Math.floor(Math.random()*World.wraithTPs.length)]
        if(Phaser.Math.Distance.BetweenPoints(this,target) > 300){

            let prevCords = {x:this.x,y:this.y}

            this.sprite.setVisible(false)
            this.healthbar.setVisible(false)
            this.healthbarBorder.setVisible(false)
            this.indestructible = true

            particles.wraithEmerge.emit(this.x,this.y)

            this.setPosition(target.x,target.y)

            particles.wraithTeleport.emitter.Circle.moveToX.propertyValue = this.x
            particles.wraithTeleport.emitter.Circle.moveToY.propertyValue = this.y

            for(let i = 0; i < 10; i++){
                particles.wraithTeleport.emit(prevCords.x + 16 - (Math.random()*32), prevCords.y + 32 - (Math.random()*64) )
            }

            World.time.delayedCall(700,()=>{

                this.sprite.setVisible(true)
                this.indestructible = false

                particles.wraithEmerge.emit(this.x,this.y)

                this.switchState(this.links.special)

            },null,this)

            break;
        }
    }
}

levitate(){
    if(this.touchingTiles.down.canCollide){
        this.body.setVelocityY(-this.baseMove)
        this.body.allowGravity = false;
    }
    else if(this.touchingTiles.up.canCollide){
        this.body.setVelocityY(this.baseMove)
    }
    else this.body.setVelocityY(0)
}


getHPValues(key){
    let value
   for(let i = 0; i < this.hpValues[key].length; i++){
    if((this.hp / this.maxhp * 100) <= this.hpValues[key][i].threshold){
        value = this.hpValues[key][i].value
    }
   }
   return value
}

genFollowEvents(){
    
}
    
// *** End of Class ************************************************************************************************
}