export default class HitboxBase{
    constructor(config){
        this.private  = false;
        this.user = this;
        this.type = 'rectangle'; 
        this.x = 0;
        this.y = 0;
        this.width = 32;
        this.height = 32;
        this.anchorX = 0;
        this.anchorY = 0.5;
        this.duration = 10;
        this.ignore = {type  : 'player'};
        this.vectorMod = {x:0,y:0};
        this.attack = {
            power: 1,
            knockback: 1,
            penetration: 1
        }
        Object.keys(config).forEach(key => {
            this[key] = config[key]
        })
    }
}