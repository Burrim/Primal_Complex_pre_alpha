import Phaser from "phaser";

export default class FixedStructure extends Phaser.GameObjects.Sprite{
    constructor(init,config){
       super(init.scene, init.x, init.y,init.texture)
       
        World.physics.world.enable(this);
        World.add.existing(this);

        this.body.allowGravity = false
        this.setPipeline('Light2D')
        this.body.immovable = true


        this.setDepth(-1)
        World.structures.push(this)

        this.touching = []
    }
    activate(){

    }
    deactivate(){
        this.setActive(false)
        this.body.enable = false
        this.setVisible(false)
    }
}
