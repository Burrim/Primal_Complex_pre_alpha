
import Phaser from "phaser"
import Player from "./Player"


export default class Item extends Phaser.GameObjects.Sprite{
    constructor(config, props){
        super(World, config.x, config.y, config.spriteKey, config.frame)
        this.type = 'pickup'

        this.id = assignId()
        this.itemType = props.type
        this.props = props

        World.physics.world.enable(this);
        World.add.existing(this);
        this.setPipeline('Light2D')

        this.body.allowGravity = true;
        this.body.setSize(24, 24, false);
        this.setSize(24, 24, false);

        World.items.push(this)

        //End of Constructor *****************************************************************************
    }
    init(){
        switch(this.itemType){
            case 'energyCore':
                this.body.setSize(32, 48, false);
                this.setSize(32, 48, false);
                this.light = World.lights.addLight(this.x, this.y, 500, "0x84e9d0", 2)
                this.play('props-energyCore')
                if(World.tempData.energyCoreCnt == undefined) World.tempData.energyCoreCnt = 0
                World.tempData.energyCoreCnt++;  
            break;
        }
    }

    onPickup(){
        switch(this.itemType){
            case 'healthPickup':
                Audio.playSE(this,'pickup',{range:500})
                player.hp += this.props.healAmount
                if(player.hp > player.maxhp) player.hp = player.maxhp
            break;
            case 'energyPickup':
                Audio.playSE(this,'pickup',{range:500})
                player.energy += this.props.healAmount
                if(player.energy > player.maxenergy) player.energy = player.maxenergy
            break;

            case 'energyCore':
                
                this.light.setRadius(0)
                World.tempData.energyCoreCnt--

                //All Cores Collected
                if(World.tempData.energyCoreCnt == 0){

                    Audio.playSE(this,'doorUnlocked',{global:true})
                    renderFloatingText(files.floatingTexts.messages.doorOpen)
                    document.getElementById('floatingTextContainer').style.opacity = `100%`

                    World.time.delayedCall(120*frame,()=>{document.getElementById('floatingTextContainer').style.opacity = `0%`})

                    World.interactables.forEach(entry => {
                        if(entry.structureType == 'portal' && entry.props.key == 'goal'){
                            entry.sprite.play(`portal-${entry.props.color}_activating`)
                            entry.interactable = true
                            entry.light = World.lights.addLight(entry.x, entry.y, 1000, "0x84e9d0", 2)
                            World.time.delayedCall( 120*frame, function(){this.sprite.play(`portal-${entry.props.color}_swirling`) },null, entry)
                        }
                    })
                }
                //Not all Cores collected
                else{
                    Audio.playSE(this,'pickup',{range:500})
                    renderFloatingText(files.floatingTexts.messages[`coreRemainder${World.tempData.energyCoreCnt}`])
                    document.getElementById('floatingTextContainer').style.opacity = `100%`

                    World.time.delayedCall(120*frame,()=>{document.getElementById('floatingTextContainer').style.opacity = `0%`})
                } 
            break;
        }
        this.setActive(false).setVisible(false)
        this.body.enable = false
    }

}


