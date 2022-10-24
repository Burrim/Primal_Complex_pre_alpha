import createHitbox from "../../system/HitboxGenerator"

export default class Technique{
    constructor(){

    }
    attack(){
        if(player.energy < this.energyCost) return
        player.energy -= this.energyCost

        player.body.setVelocityX(player.body.velocity.x/5)

        let stats
        if(!this.upgraded) stats = this.normalStats
        else startup = this.upgradedStats

        //Plays Animation and Pauses it at the start
        player.sprite.play(stats.animation);
        player.sprite.anims.pause()

        //Wait for Startup
        if(this.startUpEvent) this.startUpEvent()
        player.addTimer({key:'attackStartup', target: player, duration: stats.startup, interruptable: true, callback: ()=>{
            //Checks if buttons were released and starts attack, otherwise the charging process continues
            if((this.assigned == 1 && !Input.special1Hold()) || this.assigned == 2 && !Input.special2Hold()){
            }
            else {
                if(!this.upgraded) player.charging = this.executeNormal
                else player.charging = this.executeUpgraded

                if(this.assigned == 1) player.chargeRelease = () => {if(!Input.special1Hold())return true}
                else player.chargeRelease = () => {if(!Input.special2Hold())return true}

                player.switchState({newState:'attackCharging'})
            }
        }})
    }
    executeNormal(){}
    executeUpgraded(){}
}