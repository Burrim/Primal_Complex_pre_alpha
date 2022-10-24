import Mod from './ModBlueprint'

class Power_Sword extends Mod{
    constructor(){
        super()
        this.power = 1.2
    }
}

let Power = {
    Sword : new Power_Sword()
}

export default Power


