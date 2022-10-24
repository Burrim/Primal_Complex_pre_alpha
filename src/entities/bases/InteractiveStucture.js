
import EntityBase from "./EntityBase";
import React from 'react'
import ReactDOM from 'react-dom'

export default class InteractiveStructure extends EntityBase{
    constructor(config,props){
        super(config,props)
        this.type = 'structure'

        
    
        this.keyBase = World.add.image(0,0,'InputPrompts-E').setDepth(10).setOrigin(0.5);
        this.controllerButton = World.add.image(0,0,'InputPrompts-Gamepad_X').setDepth(10).setOrigin(0.5);
        this.interactText = World.add.text(40,0,'Interact',{fontFamily: 'Arial', fontSize: 18, color: '#ffffff' }).setDepth(10).setOrigin(0,0.5);

        
        this.container = World.add.container(-50,-50,[this.keyBase,this.controllerButton, this.interactText]).setVisible(false)

        this.add([this.container])

        this.setSize(32,32),
        this.body.setSize(32, 32, true);

        //this.body.setImmovable(true)

        this.structureType = props.type
        this.props = Object.assign({},props)


        this.interactDistance = props.interactDistance
        if(!this.interactDistance) this.interactDistance = 100

        this.interactable = true //Flag that can be deacivated for one use structures
        this.interactReady = false //Flag that tracks if the object fulfills all requirements to be interacted with

        this.indestructible = true
        World.updateEvents.push(this.AInew)

        this.states = []
        this.state = {}

        
    }
    init(){
        if(this.props.deactivated == 'true' && this.props.deactivated != 'false') this.interactable = false

        switch(this.structureType){
            case 'portal':
                this.setSize(64,64),
                this.body.setSize(64, 64, true);
                if(this.interactable){
                    this.sprite.play(`portal-${this.props.color}_swirling`)
                    this.light = World.lights.addLight(this.x, this.y, 500, "0xe7c7b2", 2)    
                }
            break;
        }
    }
    genEvents(){
        this.playerDis = Phaser.Math.Distance.BetweenPoints(this,player)

        
        if(this.playerDis <= this.interactDistance && this.interactable && player.currentState == 'idle'){
            this.interactReady = true
            this.container.setVisible(true)
            if(Input.activeInput == 'keyboard') this.keyBase.setVisible(true); else this.keyBase.setVisible(false)
            if(Input.activeInput == 'gamepad') this.controllerButton.setVisible(true); else this.controllerButton.setVisible(false)
        }
        else{
            this.interactReady = false
            this.container.setVisible(false)
            
        }

        if(this.structureType == 'pistonController'){
            if(this.body.velocity.y != 0) this.interactable = false
            else if (this.body.velocity.y == 0) this.interactable = true
        }
        
        
    }

    triggerInteraction(){

        Input.buffer = {}

        switch(this.structureType){
            case 'checkpoint': 
                player.hp = player.maxhp
                player.extraLives = player.maxExtraLives
                SaveManager.save()
            break

            case 'pistonController':
                World.pistonControl(this.props.target)
                this.interactable = false
            break;

            case 'portal':
                if(this.props.key == 'goal') localStorage.setItem(selectedMap+'-completed',true)
                HUD.loading2.setVisible(true)
                SaveManager.saveGame = {}
                Input.trigger = {keyboard:{}, gamepad:{}}
                World.enemies.forEach(enemy =>{
                    enemy.active = false
                })
                World.time.delayedCall(90*frame, function(){
                    Setup.loadMap(this.props.destination)
                },null,this)

            break;

            default: console.log(`Structure Type: ${this.structureType} is not defined`); break;
        }
    }

    showButton(){

    }

}