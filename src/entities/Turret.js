import EntityBase from "./bases/EntityBase";
import { genericEnemyPrj, Bullet } from "../data/projectiles/projectileBlueprints";
import createProjectil from "../system/ProjectilGenerator";

import createHitbox from "../system/HitboxGenerator";
import hitboxes from "../data/hitboxes/slashBlueprints";


export default class Turret extends EntityBase{
    constructor(config,props){
        super(config,props)

        this.add(this.sprite)

        if(props.orientation == 'left' || props.weaponKey == 'trackingLaser'){
            this.sprite.flipX = true
        }

        
        
        let parent = this
        this.hp = 50
        this.maxhp = this.hp
        this.type = 'enemy'
        
        this.aggroRange = 500
        
        this.busy = false
        this.recoveryState = 'combat'
        
        this.body.allowGravity = false;
        this.body.immovable = true
        this.knockbackResistance = 100;
        
        this.allow.track = true
        this.allow.charging = true //Flag Used for Starting the Charged Process
        
        this.aligned = true //Flag For Checking if the player is roughly in range of the weapon

        this.orientation = props.orientation
        
        
        this.body.setSize(32, 32, false);
        this.setSize(32, 32, false);
        this.initHealthbar()  
        
        
        this.AInew = this.AInew.bind(this)
        World.updateEvents.push(this.AInew)
        
        this.weapons = {
            stationaryBlast: {
                windup: 60,
                prjParam: {
                    radius: 16,
                    type:'image',
                    angle:3.19,
                    attack : {
                        power:10,
                        knockback:5,
                        penetration: 5
                    }
                },
                
                
            },
            trackingLaser: {
                windup: 120,
                hitbox: 'BasicExplosion',
                hitboxParam:{
                    width: 10,
                    height: 10,
                    ignore: {type:'enemy'},
                    attack : {
                        power:40,
                        knockback:5,
                        penetration: 60
                    }
                },
                
            },
        }
        
        if(this.sprite.flipX) this.weapons.stationaryBlast.prjParam.angle = 0
        
        
        this.weapon = this.weapons[props.weaponKey]
        this.weaponKey = props.weaponKey
        
        this.state = {}
        this.states = [
            { 
                //-------------- Idle-----------------------------------------------------------------------------------------------------------------
                
                key: 'idle',
                events: () =>{},
                links:[{  
                    newState: 'combat', //Goes in to Combat mode when the player draws near
                    weight: () => {
                        if(this.playerDis < this.aggroRange && this.aligned)
                        return true; else return 0;
                    },
                    action: ()=>{
                        this.sprite.setFrame(1)
                    }
                }] 
            },
            { 
                //--------------- Combat ----------------------------------------------------------------------------------------------------------------
                
                key: 'combat',
                events: () => {},
                links:[{ 
                    newState: 'idle', //Goes in to idle Mode when the Player distances themself and the Turret isn't doing anything at the moment
                    weight: ()=>{
                        if(parent.playerDis > parent.aggroRange && this.allow.charging || !this.aligned && this.allow.charging)
                        return true; else return 0;
                    },
                    action: ()=>{
                        this.sprite.setFrame(0)
                    }
                },
                {
                    newState: 'charging', //Switches to a charging State
                    weight: ()=>{
                        if(this.allow.charging && this.aligned) return true
                        else return 0
                    },
                    action: () => {this.addTimer({target: this, key:'charging', interruptable: true, duration: this.weapon.windup, callback:()=>{this.state.charging.charged = true} })} 
                }]
            },{ 
                
                //--------------- Charging ----------------------------------------------------------------------------------------------------------------
                
                key: 'charging',
                charged: false,
                events: () => {
                    if(this.weaponKey == 'stationaryBlast'){}
                },
                links:[
                {
                    newState: 'combat', //Waits until Attack is charged then switches to combat state
                    weight: () => {
                        if(this.state.charging.charged) return true
                        else return 0
                    },
                    action: this.shoot
                }
                ]
            }
        ]
        
        //-------------------------------------------------------------------------------------------------------------------------------       
        
        this.states.forEach( state => {
            this.state[state.key] = state
        })
        
        //Init Settings
        if(props.weaponKey == 'trackingLaser'){ //f21351
            this.laserPointer = World.add.line(0,0, this.x, this.y, this.x, this.y, 0x3ad1d2).setVisible(false).setDepth(-1).setAlpha(0.3);
            this.baseSprite = World.add.sprite(0,0, 'sentry-Sentry_Laser',2).setPipeline('Light2D')
            switch(props.orientation) {
                case 'right': this.sprite.flipY = true; break;
                case 'left': this.baseSprite.flipX = true; break;
                case 'down': this.baseSprite.setAngle(90); break;
                case 'up': this.baseSprite.setAngle(-90); this.sprite.flipY = true;
            }
            this.add(this.baseSprite)
        }
        else if(props.weaponKey == 'stationaryBlast'){
            switch(props.orientation) {
                case 'left': this.weapon.prjParam.angle = 0; this.weapon.prjParam.rotation = 180; break
                case 'down':  this.weapon.prjParam.angle = -3.19/2; this.sprite.setAngle(90); this.weapon.prjParam.rotation = 90; break
                case 'up': this.weapon.prjParam.angle = 3.19/2; this.sprite.setAngle(-90); this.weapon.prjParam.rotation = -90; break
            }
        }
        //End of Constructor *****************************************************************************
        
    }
    
    genEvents(){
        this.playerDis = Phaser.Math.Distance.BetweenPoints(this,player)


        if(this.weaponKey == 'trackingLaser' && this.playerDis < 600 && (
            this.orientation == 'right' && this.x >= player.x ||
            this.orientation == 'left' && this.x <= player.x ||
            this.orientation == 'down' && this.y >= player.y ||
            this.orientation == 'up' && this.y <= player.y
        )){
            if(!this.allow.track) return
            //Calculates a endpoint further behind the player that cuts trough the turret and the player
            let cords = {
                x: player.x - (this.x - player.x) * 600 / this.playerDis, 
                y: player.y - (this.y - player.y) * 600 / this.playerDis 
            }

            this.targetCords = { x : player.x, y : player.y }  

            //Adds a slight Delay to the lasertracker
            World.time.delayedCall(
                4*frame, 
                function(target){
                    this.laserPointer.setVisible(true)
                    if(!this.allow.track) return
                    this.laserPointer.setTo( this.x,this.y,target.x,target.y)
                    this.sprite.setRotation(Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y))  
                },[cords], this)
        }
        else if(this.weaponKey == 'trackingLaser') {this.laserPointer.setVisible(false)}
        else if(this.weaponKey == 'stationaryBlast'){
            //Checks if the player is inside a somewhat small tunnel before the shoot direction of the weapon
            // (The Orientation var indicates the direction on which wall the sentry is placed not in which direction it shoots)
            if(Math.abs(this.y - player.y) < 64 && this.x > player.x && this.orientation == 'right' ) this.aligned = true
            else if (Math.abs(this.y - player.y) < 64 && this.x < player.x && this.orientation == 'left') this.aligned = true
            else if (Math.abs(this.x - player.x) < 64 && this.y > player.y && this.orientation == 'down') this.aligned = true
            else if (Math.abs(this.x - player.x) < 64 && this.y < player.y && this.orientation == 'up') this.aligned = true
            else this.aligned = false 
        }
    } 

    shoot = () => {
        switch(this.weaponKey){
//--------------- Stationary Blast ----------------------------------------------------------------------------------------------------------------
            case 'stationaryBlast':
                this.setAllow('charging', 30*9)
                World.time.addEvent({
                    delay: 20*frame,                // ms
                    callback: function(){
                        if(this.hp <= 0) return
                        createProjectil(new Bullet(this, this.weapon.prjParam))
                        Audio.playSE(this,'shoot1',{range:500})
                    },
                    callbackScope: this,
                    repeat: 4
                });
            break;
//--------------- Tracking Laser ----------------------------------------------------------------------------------------------------------------
            case 'trackingLaser':
                if(this.laserPointer.visible){
                    this.step = {
                       x: (player.x - this.x) / (this.playerDis/30),
                       y: (player.y - this.y) / (this.playerDis/30)
                    }
                    //Makes the Laserpointer more noticable and stops its movement, cues the player to evade as the attack is coming any second
                    this.allow.track = false
                    this.laserPointer.setStrokeStyle(1,0xf21351,0.6)

                    World.time.delayedCall(25*frame,function(){
                        //Creates original Hitbox for the Laser and sets Sprite to a more menacing appearance
                        this.laserPointer.setStrokeStyle(16,0xf21351,0.6).setBlendMode('ADD')
                        Audio.playSE(this,'laser',{range:500})                 
                        this.weapon.hitboxParam.x = this.x
                        this.weapon.hitboxParam.y = this.y
                        this.weapon.hitboxParam.link = undefined
                        this.weapon.hitboxParam.link = createHitbox(new hitboxes[this.weapon.hitbox](this.weapon.hitboxParam))
                        
                        //Creates a bunch of copies of the original hitbox arranged in a line
                        for(let i = 0; i < 20; i++){
                            this.weapon.hitboxParam.x += this.step.x
                            this.weapon.hitboxParam.y += this.step.y
                            createHitbox(new hitboxes[this.weapon.hitbox](this.weapon.hitboxParam))
                        }
                        //After a short delay resets the laser Pointer and allows tracking again
                        World.time.delayedCall(25*frame,function(){
                            this.allow.track = true
                            this.laserPointer.setStrokeStyle(1,0x3ad1d2,0.3).setBlendMode(0)
                            this.laserPointer
                        },null,this)

                    }, null,this)
                }
                break;
            }
            this.state.charging.charged = false
        }

    //--------- State

    onDeath(){
        if(this.laserPointer) this.laserPointer.setAlpha(0)
    }

}


