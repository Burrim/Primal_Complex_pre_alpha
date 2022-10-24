import FireArm from "./FirearmBlueprint";
import createProjectil from '../../system/ProjectilGenerator';
import projectiles from '../../data/projectiles/projectileBlueprints.js'

export default class EnergyShot extends FireArm{
    constructor(slot){
        super(slot)
        this.upgraded = false
        this.energyCost = 200
        this.eneryTick = 5
        this.loading = false
        this.loadingDur = 0
        
    }
    use(){
        this.loaded = true
        if(this.fullyCharged) this.shoot()
    }

    shoot(){
        
        let direction
        if(player.sprite.flipX) direction = 3.14
        else direction = 0
        let data ={
            x: player.x, y: player.y,
            attack : { power:20, knockback:5, penetration: 20 },
            angle : direction,
            blendMode: 'ADD',
            sprite: 'fire-Flame1',
            animation: 'fire-Flame1',
            type : 'sprite'
        }

        if(this.fullyCharged){
            data.attack.power = 100
            data.attack.knockback = 20
            data.radius = 80
            data.impactParticle = "projectilImpactBig"
        }
        else if(this.loadingDur <= 20){
            data.attack.power = 20
            data.attack.knockback = 5
            data.radius = 20
        }
        else if(this.loadingDur <= 40){
            data.attack.power = 50
            data.attack.knockback = 10
            data.radius = 40
        }
        else if(this.loadingDur <= 60){
            data.attack.power = 80
            data.attack.knockback = 15
            data.radius = 60
        }


        this.loadingDur = 0
        this.loaded = false
        this.fullyCharged = false

        Audio.playSE(this,'shoot1',{global:true})
        createProjectil(new projectiles.BasicProjectile(data))
    }

    update(){
        if(!this.loaded) return
        if(Input.shootHold()){
            //Checks if enough Energy is left for charging
            if(player.energy >= this.eneryTick){
                this.loadingDur++
                this.energy -= this.energyTick
                particles.enemyCharge.emit(player.x,player.y)
            }
            if(this.loadingDur >= 80){
                this.fullyCharged = true
                this.loaded = false
                particles.powerShotReady.emit(player.x,player.y)
                Audio.playSE(player,'fullyCharged',{global:true})
                //play loaded sound
            } 
        }
        else{
            this.shoot()
        }
    }
}