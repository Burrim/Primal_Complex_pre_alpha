import hitboxes from '../hitboxes/slashBlueprints.js'
import createHitbox from '../../system/HitboxGenerator';
import createHitboxArc from '../../system/createHitboxArc.js';

import Power from '../mods/Power'
import Default from '../mods/Power'
import Deflect from '../mods/Deflect'

export default class Weapon {
    constructor(){
    }

// *** Utility ****************************************************************************************************************

applyMod(modKey){
    switch(modKey){
        case 'Power': this.mod = Power[this.type]; break;
        case 'Default': this.mod = Default[this.type]; break;
        case 'Deflect': this.mod = Deflect[this.type]; break;
        default: 'Mod Key is invalid' 
    }

    let list = [
        this.groundSideStats,
        this.groundUpStats,
        this.groundDownStats,
        this.airSideStats,
        this.airUpStats,
        this.airDownStats,
    ]

    list.forEach(stat => {
        stat.hitboxParam.attack.power *= this.mod.power
        stat.hitboxParam.attack.knockback *= this.mod.knockback
        stat.startup *= this.mod.startup
        stat.duration *= this.mod.duration
        stat.cooldown *= this.mod.cooldown

        
        Object.keys(this.mod.props).forEach(key => {
            stat.hitboxParam.attack[key] = this.mod.props[key]
        })
    })
}

// *** Ground Attacks *********************************************************************************************************
    attack(){

        player.body.setVelocityX(player.body.velocity.x/5)
        let direction;

        if((Input.upHold() && !Input.secActive()) || Input.secUpHold())
        direction = 'Up'
        
        else if( (Input.downHold() && !Input.secActive()) || Input.secDownHold() )
        direction = 'Down'
        
        else {
             //Turns Sprite if the right stick/WASD is used for attacks
             if(Input.secRightHold()) player.sprite.flipX = false
             else if (Input.secLeftHold()) player.sprite.flipX = true;

             direction = 'Side'
        }
        //Plays Animation and Pauses it at the start
        player.sprite.play(this[`ground${direction}Stats`].animation);
        player.sprite.anims.pause()

        //Wait for Startup
        player.addTimer({key:'attackStartup', target: player, duration: this[`ground${direction}Stats`].startup, interruptable: true, callback: ()=>{
            //Checks if buttons were released and starts attack, otherwise the charging process continues
            if((!Input.attackHold() && !Input.secActive())) this[`ground${direction}Attack`]()
            else  {
                player.charging = this[`ground${direction}Attack`]
                player.switchState({newState:'attackCharging'})
                player.chargeRelease = () => {if(!(Input.attackHold() || Input.secActive()))return true}
            }
        }})
    }

    groundSideAttack = () =>{
        
            //Resume Animation
            player.sprite.play(this.groundSideStats.animation);
            
            //Plays and if necessary deforms slash animation
            player.playSlashAnim(this.groundSideStats.slashAnim.key, 0, this.groundSideStats.duration)
            Audio.playSE(player,this.groundSideStats.se.key,{global:true})
            player.slashSprite.scaleX = this.groundSideStats.slashAnim.width
            player.slashSprite.scaleY = this.groundSideStats.slashAnim.height

            createHitbox(new hitboxes[this.groundSideStats.hitbox](this.groundSideStats.hitboxParam))
            
            //Wait For Endlag
            player.addTimer({key:'Endlag', target: player, duration: this.groundSideStats.cooldown, interruptable: true, callback: ()=>{
                player.switchState({newState:'idle'})
            }})
        
    }

    groundUpAttack =() => {

            player.sprite.play(this.groundUpStats.animation);
            
            //Plays and if necessary deforms slash animation
            player.playSlashAnim(this.groundUpStats.slashAnim.key, -90, this.groundUpStats.duration)
            Audio.playSE(player,this.groundSideStats.se.key,{global:true})
            player.slashSprite.scaleX = this.groundUpStats.slashAnim.width
            player.slashSprite.scaleY = this.groundUpStats.slashAnim.height
    
            createHitbox(new hitboxes[this.groundUpStats.hitbox](this.groundUpStats.hitboxParam))

            //Wait For Endlag
            player.addTimer({key:'Endlag', target: player, duration: this.groundUpStats.cooldown, interruptable: true, callback: ()=>{
                player.switchState({newState:'idle'})
            }})
        
    }

    groundDownAttack = () => {

            //Resume Animation
            player.sprite.play(this.groundDownStats.animation);
            
            //Plays and if necessary deforms slash animation
            player.playSlashAnim(this.groundDownStats.slashAnim.key, 0, this.groundDownStats.duration)
            Audio.playSE(player,this.groundSideStats.se.key,{global:true})
            player.slashSprite.scaleX = this.groundDownStats.slashAnim.width
            player.slashSprite.scaleY = this.groundDownStats.slashAnim.height
    
            createHitbox(new hitboxes[this.groundDownStats.hitbox](this.groundDownStats.hitboxParam))

            //Wait For Endlag
            player.addTimer({key:'Endlag', target: player, duration: this.groundDownStats.cooldown, interruptable: true, callback: ()=>{
                player.switchState({newState:'idle'})
            }})
    }

// *** Aerial Attacks **************************************************************************************************************************************

    airAttack(){
        player.body.setVelocityX(player.body.velocity.x/2)
        if( (Input.upHold() && !Input.secActive()) || Input.secUpHold())
        this.airUpAttack()
        else if( (Input.downHold() && !Input.secActive()) || Input.secDownHold() )
        this.airDownAttack()
        else 
        this.airSideAttack()
    }

    airSideAttack(){
        
        //Turns Sprite if the right stick/WASD is used for attacks
        if(Input.secRightHold()) player.sprite.flipX = false
        else if (Input.secLeftHold()) player.sprite.flipX = true;

        //Plays Animation and Pauses it at the start
        player.sprite.play(this.airSideStats.animation);
        player.sprite.anims.pause()

        //Wait for Startup
        player.addTimer({key:'attackStartup', target: player, duration: this.airSideStats.startup, interruptable: true, callback: ()=>{
            //Resume Animation
            player.sprite.play(this.airSideStats.animation);
            
            //Plays and if necessary deforms slash animation
            player.playSlashAnim(this.airSideStats.slashAnim.key, 0, this.airSideStats.duration)
            Audio.playSE(player,this.groundSideStats.se.key,{global:true})
            player.slashSprite.scaleX = this.airSideStats.slashAnim.width
            player.slashSprite.scaleY = this.airSideStats.slashAnim.height

            createHitbox(new hitboxes[this.airSideStats.hitbox](this.airSideStats.hitboxParam))
    
            //Wait For Endlag
            player.addTimer({key:'Endlag', target: player, duration: this.airSideStats.cooldown, interruptable: true, callback: ()=>{
                player.switchState({newState:'idle'})
            }})
        }})
    }

    airUpAttack(){
        
        //Plays Animation and Pauses it at the start
        player.sprite.play(this.airUpStats.animation);
        player.sprite.anims.pause()

        //Wait for Startup
        player.addTimer({key:'attackStartup', target: player, duration: this.airUpStats.startup, interruptable: true, callback: ()=>{
            //Resume Animation
            player.sprite.play(this.airUpStats.animation);
            
            //Plays and if necessary deforms slash animation
            player.playSlashAnim(this.airUpStats.slashAnim.key, -90, this.airUpStats.duration)
            Audio.playSE(player,this.groundSideStats.se.key,{global:true})
            player.slashSprite.scaleX = this.airUpStats.slashAnim.width
            player.slashSprite.scaleY = this.airUpStats.slashAnim.height

            createHitbox(new hitboxes[this.airUpStats.hitbox](this.airUpStats.hitboxParam))
    
            //Wait For Endlag
            player.addTimer({key:'Endlag', target: player, duration: this.airUpStats.cooldown, interruptable: true, callback: ()=>{
                player.switchState({newState:'idle'})
            }})
        }})
    }

    airDownAttack(){
        
        //Plays Animation and Pauses it at the start
        player.sprite.play(this.airDownStats.animation);
        player.sprite.anims.pause()

        //Wait for Startup
        player.addTimer({key:'attackStartup', target: player, duration: this.airDownStats.startup, interruptable: true, callback: ()=>{
            //Resume Animation
            player.sprite.play(this.airDownStats.animation);
            
            //Plays and if necessary deforms slash animation
            player.playSlashAnim(this.airDownStats.slashAnim.key, 90, this.airDownStats.duration)
            Audio.playSE(player,this.groundSideStats.se.key,{global:true})
            player.slashSprite.scaleX = this.airDownStats.slashAnim.width
            player.slashSprite.scaleY = this.airDownStats.slashAnim.height

            createHitbox(new hitboxes[this.airDownStats.hitbox](this.airDownStats.hitboxParam))
    
            //Wait For Endlag
            player.addTimer({key:'Endlag', target: player, duration: this.airDownStats.cooldown, interruptable: true, callback: ()=>{
                player.switchState({newState:'idle'})
            }})
        }})
    }

    }

