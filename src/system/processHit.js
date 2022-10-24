import createProjectil from "./ProjectilGenerator";
import createText from "./TextGenerator";

export default function processHit(hitbox, target){

// *** Hit Conformation *********************************************************************************
    if(target.indestructible) return

    let legitHit = true
    //Checks if the Target is on the ignore List
    Object.keys(hitbox.ignore).forEach(key =>{
        if(hitbox.ignore[key] == target[key]) legitHit = false;
    })
    if(!legitHit) return

    //Checks if the target was already hit before
    hitbox.hitList.forEach(id =>{
        if(id == target.id) legitHit = false
    })
    if(!legitHit) return

    hitbox.hitList.push(target.id) //Adds Id of target so that it will not get hit again on the next frame

// *** Resolve Hit ******************************************************************************************* 

    //Afflicts blockdamage if target is blocking
    if(target.isBlocking){
        target.blockHit(hitbox.attack.penetration)
    }

    //Damage is afflicted
    let damage = Math.floor( (hitbox.attack.power * (1 + (Math.random()/5))) * ((100-target.defense)/100)  )
    target.takeDamage(damage)
    createText({x:target.x,y:target.y,text: JSON.stringify(damage)})

    // --- Effects ---
    //Particle
    if(hitbox.attack.particle != undefined)
    particles[hitbox.attack.particle].emit(target.x, target.y)

    //Particle for Projectils? 
    if(hitbox.type == 'projectil' && hitbox.impactParticle != undefined)
    particles[hitbox.impactParticle].emit(hitbox.x, hitbox.y)

    //Hitlag
    if(hitbox.shake) World.cameras.main.shake(hitbox.shake.duration, hitbox.shake.intensity);

    //Special Functions
    if(hitbox.attack.onHit != undefined)
    hitbox.attack.onHit()

    if(damage > 0)
    Audio.playSE(this,'impact',{global:true})


// *** Knockback ***************************************************************************************************/
    
    //Applies stun and knockback for entities that aren't immune to it
    let stun = Math.floor(hitbox.attack.knockback * (100-target.knockbackResistance)/100)
    if(stun > 0){

        //Vector Origin
        let vectorOrigin = {
            x : hitbox.x,
            y : hitbox.y
        }
        //If the hitbox is bound to an entity the coordinates of said entity are taken instead for knockback calculations
        if(hitbox.private)
        vectorOrigin = {
            x : hitbox.user.x,
            y : hitbox.user.y
        }
        if(hitbox.config.vectorMod){
            vectorOrigin.x += hitbox.config.vectorMod.x
            vectorOrigin.y += hitbox.config.vectorMod.y
        }


        let vector = World.physics.velocityFromRotation(Phaser.Math.Angle.Between(vectorOrigin.x, vectorOrigin.y, target.x, target.y), 1000) 
        target.body.setVelocity(vector.x,vector.y)

        
        target.switchState({
            newState : 'stunned',
            props: stun,
            action : function(stun) { 
                target.stun = stun

                //Ads Timer for Release Action after Stun
                target.addTimer({
                    key:'knockback', 
                    interruptable: false, 
                    duration: stun, 
                    callback:()=>{ target.switchState({
                        newState : target.recoveryState,
                        action: function(){target.body.setVelocityX(0)} 
                    })}})
            }
        })
    }


// *** Cleanup *********************************************************************************************

    //Disables Hitbox on impct if it is an non persistant Projectil
    if(hitbox.type == 'projectil' && !createProjectil.persistance) hitbox.deactivate()
     
}