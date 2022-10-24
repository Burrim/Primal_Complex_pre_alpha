export class genericEnemyPrj{
    constructor(user, custom) {
    this.type = 'circle';
            this.user = user
            this.x = user.x;
            this.y = user.y; 
            this.radius = 5,
            this.color = '0xf21351',
            this.angle = Phaser.Math.Angle.Between(user.x, user.y, player.x, player.y),
            this.speed = 500,
            this.particle = particles.Circle5,
            this.impactParticle = "projectilImpact",
            this.ignore = {type :'enemy'},
            this.attack = {
                power:20,
                knockback:5,
                penetration: 5
            }
            if(custom){
                Object.keys(custom).forEach(key => {this[key] = custom[key]})
            }
    }
} 

export class fireball{
    constructor(user, custom) {
    this.type = 'sprite';
            this.user = user
            this.x = user.x;
            this.y = user.y; 
            this.radius = 40,
            this.angle = Phaser.Math.Angle.Between(user.x, user.y, player.x, player.y),
            this.speed = 500,
            this.particle = particles.SmallEmbers,
            this.color = '0xf21351',
            this.blendMode = 'ADD'
            this.sprite = 'fire-Flame1'
            this.animation = 'fire-Flame1'
            this.impactParticle = "projectilImpact",
            this.impactAnimationProps = {duration: 12, size: 120}
            this.ignore = {type :'enemy'},
            this.attack = {
                power:20,
                knockback:5,
                penetration: 20
            }
            if(custom){
                Object.keys(custom).forEach(key => {this[key] = custom[key]})
            }
    }
} 

export class genericFreeAimPrj{
    
}

class BasicProjectile{
    constructor(config){
        this.type = 'circle';
        this.x = this.x;
        this.y = this.y; 
        this.radius = 5;
        this.color = '0xf21351';
        this.angle = 0;
        this.speed = 1500;
        this.particle = particles.projectils;
        this.impactParticle = "projectilImpact";
        this.ignore = {type: 'player'};
        Object.keys(config).forEach(key => {
            this[key] = config[key]
        })
    }

}

export class Bullet extends genericEnemyPrj{
    constructor(user, custom){
        super(user, custom)
        this.type = 'image';
        this.color = '0xf21351';
        this.sprite = 'particle-Raindrop_001'
        this.blendMode = 'ADD'
        this.particle = undefined
        this.radius = 16
        this.spriteSize = 48
        this.speed = 1000
    }
}

const projectiles = {
    BasicProjectile : BasicProjectile
}

export default projectiles