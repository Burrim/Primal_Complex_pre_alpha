
import reactivateInactive from "./reactivateInactive";
    
    export default function createProjectil(config){

        let projectil;
       

        //Adds or retrieves an Object to use        
        switch(config.type){
            case 'image':
            projectil = undefined
            if(!projectil){
                //Create new Image
                projectil = World.add.sprite(config.x, config.y, config.sprite);
                World.projectiles.image.push(projectil)
                World.projectiles.all.push(projectil)

                if(config.color) projectil.setTint(config.color)
                else projectil.clearTint()
    
                if(config.radius){
                    projectil.displayWidth = config.radius
                    projectil.displayHeight = config.radius
                }
    
                if(config.spriteSize){
                    projectil.displayHeight = config.spriteSize
                    projectil.displayWidth = config.spriteSize
                }
            }  

            break;
            case 'sprite':
            projectil = reactivateInactive(World.projectiles.sprite, config.x, config.y)
            if(!projectil){
                //Create new Sprite
                projectil = World.add.sprite(config.x, config.y, config.sprite);
                World.projectiles.sprite.push(projectil)
                World.projectiles.all.push(projectil)
            } 

            // General Sprite Settings
            if(config.animation) projectil.play(config.animation)

            if(config.blendMode) projectil.blendMode = config.blendMode
            else projectil.blendMode = 'NORMAL'

            if(config.color) projectil.setTint(config.color)
            else projectil.clearTint()

            if(config.radius){
                projectil.displayWidth = config.radius
                projectil.displayHeight = config.radius
            }

            if(config.spriteSize){
                projectil.displayHeight = config.spriteSize
                projectil.displayWidth = config.spriteSize
            }

            if(config.rotation){
                projectil.setAngle(config.rotation)
            }
            else projectil.setAngle(0)



            break;
            case 'circle': 
            projectil = reactivateInactive(World.projectiles.circle, config.x, config.y)
            if(!projectil){
                //Create new Circle
                projectil = World.add.circle(config.x, config.y, config.radius, config.color);
                World.projectiles.circle.push(projectil)
                World.projectiles.all.push(projectil)
            }
            break;
        }

        

        //General Setup
        projectil.vector = World.physics.velocityFromRotation(config.angle, config.speed)
        projectil.impactParticle = config.impactParticle
        projectil.unblockable = false
        projectil.type = 'projectil'

        //Initializes physics properties
        World.physics.world.enable(projectil);
        World.add.existing(projectil);

        if(config.radius){
            projectil.body.setSize(config.radius, config.radius, true);
        }

        if(config.arc) projectil.body.setVelocityY(-config.arc)

        //Storing data inside projectil for later use in interactions
        projectil.private = config.private
        projectil.ignore = config.ignore
        projectil.attack = config.attack
        projectil.user = config.user
        projectil.gravity = config.gravity
        projectil.phase = config.phase

        projectil.config = config

        if(config.alpha!= undefined)
        projectil.alpha = config.alpha 
        else projectil.alpha = 1

        //Stores the ID of every entity that already got hit, so it doesn't get continuosly hit every single frame.
        //If a linked projectil is passed their hitlist is referenced instead of creating a new one
        if(config.link != undefined) projectil.hitList = config.link.hitList
        else projectil.hitList = [] 
       
        // *** Methods ****************************************************
        projectil.update = () => {
            if(!projectil.visible) return

            if(projectil.gravity)
            projectil.body.setVelocityX(projectil.vector.x)
            else projectil.body.setVelocity(projectil.vector.x, projectil.vector.y)

            if(config.particle != undefined)
            config.particle.emit(projectil.x, projectil.y)
        }

        projectil.collide = function(){
            if(this.phase) return //Cancels function if Projectil is set to phase trough walls

            Audio.playSE(this,'smallExplosion',{range:500})
            //Checks for an Impact Animation
            if(this.impactAnimation)
            {
                this.play(this.impactAnimation)
                this.displayWidth = this.impactAnimationProps.size
                this.displayHeight= this.impactAnimationProps.size
            }

            this.deactivate()
            if(this.impactParticle != undefined)
            particles[this.impactParticle].emit(this.x, this.y)  
        }

        projectil.deactivate = function(){

            
            this.body.enable = false

            //Checks if a death Animation is programmed otherwise the projectile gets benched
            if(this.impactAnimation)
            World.time.delayedCall(this.impactAnimationProps.duration*frame, function(){
                this.setVisible(false).setActive(false); 
            }, null, this)

            else 
            this.setActive(false).setVisible(false);
        }

        projectil.deflect = function(hitbox){
            if(this.unblockable) return
            if(hitbox.deflect){
                this.vector.x *= -1.5
                this.vector.y *= -1.5
                this.ignore = {}
                this.unblockable = true
            }
            else
            this.deactivate()
        }
        
        World.updateEvents.push(projectil.update)
        return projectil
    }

    


