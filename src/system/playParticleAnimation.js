import reactivateInactive from "./reactivateInactive"

export default function playParticleAnimation(x,y,animation,duration,tint,preConfig){
let config = {}
Object.assign(config,preConfig)

    //Creates Container Array if not already present for maximum modularity
    if(World.animParticle == undefined) World.animParticle = [] 

    //Tries to fetch inactive Sprite. If no can be found a new one is created
    let container = reactivateInactive(World.animParticle,x,y,'animParticle') 

    if(!container){
        container = World.add.sprite(x,y,'props-placeholder')
        container.type = 'animParticle'
        
        World.animParticle.push(container)
    }

    container.disable = function(){
        this.setActive(false).setVisible(false)
        World.time.removeEvent(this.testTimer)
    }
    container.disable = container.disable.bind(container)


    if(config.angle != undefined) container.setAngle(config.angle)
    else container.setAngle(0)


    if(tint != undefined) container.setTint(tint)
    else container.clearTint()

    container.play(animation)

    container.testTimer = World.time.delayedCall(duration,function(){this.disable()},null,container)
   
}