import Mod from './ModBlueprint'

class Deflect_Sword extends Mod{
    constructor(){
        super()
        this.props.deflect = true
    }
}

let Deflect = {
    Sword : new Deflect_Sword()
}

export default Deflect


