import EntityBase from "./bases/EntityBase";
import { genericEnemyPrj,fireball } from "../data/projectiles/projectileBlueprints";
import createProjectil from "../system/ProjectilGenerator";

export default class Drone extends EntityBase{
    constructor(config,props){
        super(config,props)
        let parent = this
        this.hp = 50
        this.maxhp = this.hp
        this.baseMove = 300 * (1+Math.random()/5)
        this.type = 'enemy'

        this.chaseRange = 2000
        this.approachRange = 300
        this.aggroRange = 500
        this.callRange = 300

        this.busy = false
        this.recoveryState = 'combat'
        this.swayDirection = 'up'
        this.swaycnt = 0

        this.body.allowGravity = false;
        this.body.setSize(32, 32, false);
        this.setSize(32, 32, false);
        this.initHealthbar()  
        

        this.AInew = this.AInew.bind(this)
        World.updateEvents.push(this.AInew)

        this.state = {}
        this.states = [
            { //----------------------------------------------------------
                key: 'idle',
                totWeight: 0, //used for probability calcs
                //Automatic function that gets fired every frame
                events: () =>{ 
                    this.body.setVelocity(0)
                    this.levitate()
                },
                links:[{ 
                    weight: () => {
                        if(this.playerDis < this.aggroRange)
                        return true; else return 0;
                    }, 
                    newState: 'combat',
                    action: this.aggro
                }] 
            },
            { //----------------------------------------------------------
                key: 'combat',
                events: () => {
                    this.body.setVelocity(0)
                    this.levitate()    
                },
                links:[{ 
                    newState: 'chasing',
                    weight: function(){
                        if(parent.playerDis > parent.aggroRange)
                        return true; else return 0;
                    }
                },
                {
                    newState: 'charging',
                    weight: function(){
                        if(parent.busy) return 0
                        else return 5
                    },
                    action: () => {
                        this.busy = true
                        this.addTimer({target: this, key:'busy', interruptable: false, duration: 150, callback:()=>{this.busy = false} })
                        this.addTimer({target: this, key:'charging', interruptable: true, duration: 90, callback:()=>{this.state.charging.charged = true} })
                    }
                     
                },
                { 
                    //Keeps the current State and sets a wait time until you can try again
                    newState: 'combat',
                    weight: function(){
                        if(parent.busy)
                        return 0; else return 5;
                    },
                    action: ()=> {
                        this.busy = true
                        this.addTimer({target: this, key:'busy', interruptable: false, duration: 60, callback:()=>{this.busy = false} })
                    }
                },]
            },
            { //----------------------------------------------------------
                key: 'chasing',
                events: () => {
                    World.physics.moveToObject(this, player, this.baseMove);
                },
                links:[{ 
                    weight: function(){
                        if(parent.playerDis > parent.chaseRange)
                        return true; else return 0;
                    }, 
                    newState: 'idle',
                },
                { 
                    weight: function(){
                        if(parent.playerDis < parent.approachRange)
                        return true; else return 0;
                    }, 
                    newState: 'combat',
                }]
            },
            { //----------------------------------------------------------
                key: 'charging',
                charged: false,
                events: () => {
                    this.body.setVelocity(0)
                    particles.enemyCharge.emit(this.x, this.y);
                },
                links:[
                {
                    newState: 'combat',
                    weight: () => {
                        if(this.state.charging.charged) return true
                        else return 0
                    },
                    action: () => {
                        createProjectil(new fireball(this))
                        Audio.playSE(this,'shoot1',{range:500, maxVolume:0.05})
                        this.state.charging.charged = false
                    }
                }
                ]
            }
        ]

        this.states.forEach( state => {
            this.state[state.key] = state
        })
        //End of Constructor *****************************************************************************
    }

    genEvents(){
        this.playerDis = Phaser.Math.Distance.BetweenPoints(this,player)
    }

    genFollowEvents(){
        if(this.currentState == 'charging') this.sprite.setFrame(1)
        else this.sprite.setFrame(0)

        if(this.x > player.x) this.sprite.flipX = false
        else this.sprite.flipX = true

        if(this.state != 'chasing'){
            if(this.swayDirection == 'up') this.body.setVelocityY(-30)
            else if(this.swayDirection =='down') this.body.setVelocityY(30)
            this.swaycnt += Math.random()*2

            if(this.swaycnt >= 100){
                this.swaycnt = 0
                if(this.swayDirection == 'up') this.swayDirection = 'down'
                else if(this.swayDirection == 'down') this.swayDirection = 'up'
            }
        
            
        }

    }
    
    levitate(){

        //if(World.map.core.getTileAtWorldXY(this.x-32, this.y, true, World.cameras.main, 'meta').properties.colission) this.body.setVelocityX(this.baseMove)
        //if(World.map.core.getTileAtWorldXY(this.x+32, this.y, true, World.cameras.main, 'meta').properties.colission) this.body.setVelocityX(-this.baseMove)
        //if(World.map.core.getTileAtWorldXY(this.x, this.y-32, true, World.cameras.main, 'meta').properties.colission) this.body.setVelocityY(this.baseMove)
        if(World.map.core.getTileAtWorldXY(this.x, this.y+32, true, World.cameras.main, 'meta').canCollide) this.body.setVelocityY(-this.baseMove)

    }

    //--------- State

}


