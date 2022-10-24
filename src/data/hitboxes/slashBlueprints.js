

export class BasicSlash{
    constructor(config){
        this.private  = true;
        this.user = this;
        this.type = 'rectangle'; 
        this.x = 0;
        this.y = 0;
        this.width = 128;
        this.height = 128;
        this.anchorX = 0;
        this.anchorY = 0.5;
        this.duration = 10;
        this.deflect = false;
        this.ignore = {type  : 'player'};
        this.vectorMod = {x:0,y:0}
        Object.keys(config).forEach(key => {
            this[key] = config[key]
        })
    }
}

export class BasicLongSlash extends BasicSlash{
    constructor(config){
        super(config)
        this.width = 260;
        this.height = 32;
        Object.keys(config).forEach(key => {
            this[key] = config[key]
        })
    }
}

export class BasicArcSlash extends BasicSlash{
    constructor(config){
        super(config)
        this.anchorX = 0.5
        this.width = 96
        this.height = 64
        this.startAngle = -(3.14/2)
        this.endAngle = (3.14/2)
        this.distance = 60
        this.arcDuration = 4
        Object.keys(config).forEach(key => {
            this[key] = config[key]
        })
        this.vectorMod = {x:0,y:16}
        
    }
}

export class BasicExplosion{
    constructor(config){
        this.private  = false;
        this.user = World;
        this.type = 'rectangle'; 
        this.x = 0;
        this.y = 0;
        this.width = 256;
        this.height = 256;
        this.anchorX = 0;
        this.anchorY = 0.5;
        this.duration = 3;
        this.deflect = false;
        this.ignore = {};
        Object.keys(config).forEach(key => {
            this[key] = config[key]
        })
    }
}

const hitboxes = {
    BasicSlash: BasicSlash,
    BasicLongSlash: BasicLongSlash,
    BasicArcSlash : BasicArcSlash,
    BasicExplosion : BasicExplosion
}

export default hitboxes