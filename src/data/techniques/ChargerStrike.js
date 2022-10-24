import Technique from "./TechniqueBlueprint";
import createHitbox from "../../system/HitboxGenerator";
import hitboxes from "../hitboxes/slashBlueprints";

export default class ChargerStrike extends Technique{
    constructor(){
        super()
        this.assigned; //Stores the slot this technique is equipped to
        this.upgraded = false;
        this.energyCost = 200

        this.normalStats = {
            startup: 30,
            duration: 15,
            cooldown: 25,
            animation: "alphaCharacter-Crouch",
            slashAnim: {key: 'slash-SlashV5', width: 0.1, height: 3},
            hitbox: 'BasicLongSlash',
            hitboxParam: {
                flipSensitive: true,
                user: player,
                width: 340,
                attack:{
                    power: 30,
                    knockback: 5,
                    particle: "SlashHit",
                    penetration: 20,
                    onHit: ()=>{
                        player.hp += 10
                        if(player.hp > player.maxhp) player.hp = player.maxhp
                    }
                }
            }
        }

    }
    executeNormal = () => {
        //Resume Animation
        player.sprite.play(this.normalStats.animation);
            
        //Plays and if necessary deforms slash animation
        player.playSlashAnim(this.normalStats.slashAnim.key, 0, this.normalStats.duration)
        player.slashSprite.scaleX = this.normalStats.slashAnim.width
        player.slashSprite.scaleY = this.normalStats.slashAnim.height

        player.addTimer({key:'attackStartup', target: player, duration:5, interruptable: true, callback: ()=>{
            player.slashSprite.setVisible(false)
        }})

        createHitbox(new hitboxes[this.normalStats.hitbox](this.normalStats.hitboxParam))
        
        //Wait For Endlag
        player.addTimer({key:'Endlag', target: player, duration: this.normalStats.cooldown, interruptable: true, callback: ()=>{
            player.switchState({newState:'idle'})
        }})
    }
    executeUpgraded = () => {

    }

    startUpEvent(){
        player.addTimer({key:'attackStartup', target: player, duration:15, interruptable: true, callback: ()=>{
            player.sprite.setTint('0xFF0000')
        }})

        player.addTimer({key:'attackStartup', target: player, duration:25, interruptable: false, callback: ()=>{
            player.sprite.clearTint()
        }})
    }
}