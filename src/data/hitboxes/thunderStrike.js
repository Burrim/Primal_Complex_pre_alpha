import HitboxBase from "./hitboxBase";

export default class thunderStrike extends HitboxBase{
    constructor(config){
        super(config)
        this.private  = false;
        this.width = 32;
        this.height = 64;
        this.anchorX = 0.5;
        this.anchorY = 1;
        this.deflect = false;
        this.ignore = {type  : 'enemy'};
        this.attack = {
            power: 10,
            knockback: 1,
            penetration: 40
        }
    }
}