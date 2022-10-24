import EntityBase from "./bases/EntityBase";
import hitboxes, { BasicExplosion } from "../data/hitboxes/slashBlueprints";
import createHitbox from "../system/HitboxGenerator";
import spawnItem from "../system/spawnItem";


export default class Box extends EntityBase{
    constructor(config,props){
        super(config,props)
        this.type = 'prop'
        this.boxType = props.boxType //Determines the reaction on death.

        this.recoveryState = 'hewwo'

        this.body.allowGravity = false;
        this.body.immovable = true
        this.body.setSize(32, 32, false);
        this.setSize(32, 32, false);
        
        this.state = {}
        this.states = [{}]

        //End of Constructor *****************************************************************************
    }

    genEvents(){
    }

    onDeath(){
        if(this.boxType == 'energyTank'){
            createHitbox(new BasicExplosion({
                user : this,
                private: true,
                attack : {
                    power:20,
                    knockback:5,
                    penetration: 20
                }
            }))

            spawnItem({
                position: {
                    x:this.x,
                    y:this.y
                },
                spriteKey: 'props-energyPickup',
                props: {
                    type: "energyPickup",
                    healAmount: 500
                }
            },true)
        }

        if(this.boxType == 'container'){
            
        }
    }
    
}


