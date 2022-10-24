import Phaser from "phaser"
import InteractiveStructure from "./bases/InteractiveStucture"
import FixedStructure from "./bases/FixedStructure"

export default class Piston extends Phaser.GameObjects.Container{
    constructor(init,props){
        super(init.scene, init.x, init.y)
        this.id = assignId()

        World.pistons.push(this)

        this.type = 'structure'

        this.head = World.add.sprite(0,-32, `piston-head${props.size}_${props.type}`).setPipeline('Light2D').setDepth(1)
        this.base = World.add.sprite(0,0, `piston-base_${props.type}`).setPipeline('Light2D')
        this.add([this.head,this.base])

        //Initializes Physycs properties
        World.add.existing(this);
        World.physics.world.enable(this.head);
        World.physics.world.enable(this.base);
        this.head.body.allowGravity = false;
        this.base.body.allowGravity = false;
        this.head.body.immovable = true
        this.base.body.immovable = true
        World.movingStructures.push(this.head)
        World.structures.push(this.base)

        this.head.touching =  []
        this.head.addTouching = function(target){
            for(let i = 0; i < this.head.touching.length; i++){
                if(this.head.touching[i].id == target.id) break;
                else this.head.touching.push(target)
            }
        }

        //Ads Controller on top of Piston if specified
        if(props.controller && props.controller != 'false'){
            this.controller = new InteractiveStructure(
                { scene:World,x:init.x + 0, y:init.y -64,},
                {sprite : "props-switch", type:"pistonController", target:props.tag});
            //Sticks Controller on top 
            this.controller.body.setGravityY(10000)
            World.interactables.push(this.controller)
        }

        this.segments = []
        this.heightScale = 0

        this.tag = props.tag //Tag used for selecting pistons
        this.position = 'down' //Current Piston Head Position

        this.props = props
    }
    
    move(silent){
        if(this.moving) return
        let mod
        if(this.position == 'up') mod = 0
        else if (this.position == 'down') mod = -1

        World.tweens.add({
            targets: this,
            heightScale: this.props.range*32*mod-32,
            duration: this.props.duration*frame,
            onStart: () => {
                if(!silent){
                    Audio.playSE(this,'piston_start',{global:true})
                    this.moveSound = Audio.playSE(this,'piston_move',{global:true})
                }
                this.moving = true
                if(this.position == 'up') 
                this.head.body.setVelocityY(-this.props.range*32/this.props.duration*60)
                else if (this.position == 'down')
                this.head.body.setVelocityY(this.props.range*32/this.props.duration*60) 
            },
            onComplete:() =>{
                if(!silent){
                    Audio.playSE(this,'piston_stop',{global:true})
                    Setup.sound.stopByKey('piston_move')
                }
                this.moving = false
                this.head.body.setVelocityY(0)
                if(this.position == 'down') this.head.y = this.base.y -32
                else if (this.position == 'up') this.head.y = this.base.y -32*(this.props.range + 1)
            },
            onUpdate:  (tween)=>{
                const value = Math.floor(tween.getValue());
                //Spawns Segments when going up
                if(this.position == 'up'){
                    if(-value > this.segments.length *32 + 32){
                        this.segments.push(new FixedStructure({scene:World,x:this.x,y:this.y - 32 - (this.segments.length*32),texture:`piston-segment_tower`})) //
                    }
                }
                //Removes Segments when going down
                else if(this.position == 'down'){ 
                    if(-value <= (this.segments.length-1) *32 + 36){
                        if(this.segments[this.segments.length-1])
                        this.segments[this.segments.length-1].deactivate()
                        this.segments.pop()
                    }
                }   
            }            
        });
        
        if(this.position == 'up') this.position = "down"
        else if (this.position == 'down') this.position = 'up'
    }
    
}

