import createProjectil from '../../system/ProjectilGenerator';
import projectiles from '../../data/projectiles/projectileBlueprints.js'


export default class FireArm{
    constructor(slot){
        this.slot = slot
    }
    trigger(){
        if(player.energy < this.energyCost) return
        player.energy -= this.energyCost
        
        this.use()
        //if(this.upgraded) this.execUpgraded()
        //else this.execNormal()
    }
    update(){}
}