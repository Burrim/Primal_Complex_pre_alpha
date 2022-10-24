import Mod from './ModBlueprint'

class Default_Sword extends Mod{
    constructor(){
        super()
        this.power = 1.2
    }
}

let Default = {
    Sword : new Default_Sword()
}

export default Default


