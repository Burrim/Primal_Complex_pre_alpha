
import Drone from "../entities/Drone"
import Turret from "../entities/Turret"
import Slasher from "../entities/Slasher"
import Thrower from "../entities/Thrower"
import Fodder from "../entities/Fodder"
import Box from "../entities/box"
import InteractiveStructuret from "../entities/bases/InteractiveStucture"
import FixedStructure from "../entities/bases/FixedStructure"
import Piston from "../entities/Piston"
import reactivateInactive from "./reactivateInactive"
import Wraith from "../entities/Wraith"


export default function createEnemy(config){
    let enemy
    //Creates new Object if the game coulnd't fetch an old bject to reuse
    if(!enemy){
        switch(config.data.key){
            case 'drone': enemy = new Drone({ scene:World,x:config.position.x, y:config.position.y,},config.data.props); break;

            case 'turret':
            let modR; let modL; let modD; let modU 
            let x; let y
            if(config.data.props.weaponKey == 'stationaryBlast') { modR = 10; modL = 22; modD = 10; modU = 22}
            else if (config.data.props.weaponKey == 'trackingLaser') { modR = 46; modL = 19; modD = 13; modU = 19} 

            switch(config.data.props.orientation){
                case 'right':
                    x = config.position.x + modR
                    y = config.position.y
                break
                case 'left':
                    x = config.position.x + modL
                    y = config.position.y
                break;
                case 'down':
                    x = config.position.x;
                    y = config.position.y + modD
                break;
                case 'up':
                    x = config.position.x;
                    y = config.position.y + modU
                break;
            }
            enemy = new Turret({ scene:World,x:x, y:y,},config.data.props); 
            break;

            case 'slasher': enemy = new Slasher({ scene:World,x:config.position.x, y:config.position.y,},config.data.props); break;
            case 'thrower': enemy = new Thrower({ scene:World,x:config.position.x, y:config.position.y,},config.data.props); enemy.body.setImmovable(true); break;
            case 'fodder': enemy = new Fodder({ scene:World,x:config.position.x, y:config.position.y,},config.data.props); break;
            case 'wraith': enemy = new Wraith({ scene:World,x:config.position.x, y:config.position.y,},config.data.props); break;

            case 'portal':
            case 'checkpoint':
            case 'pistonController':
            let interactable 
            interactable = new InteractiveStructuret({ scene:World,x:config.position.x, y:config.position.y,},config.data.props);
            interactable.init()
            World.interactables.push(interactable) 
            break;
            
            case 'crate':
                enemy = new Box({scene:World,x:config.position.x+16, y:config.position.y+16},config.data.props); 
                World.structures.push(enemy)
                enemy.body.setImmovable(true)
                enemy.body.allowGravity = false;
            break;

            case 'piston': enemy = new Piston({scene:World,x:config.position.x+16, y:config.position.y+16},config.data.props)
            World.structures.push(enemy)
            break;

            default: console.log(`Enemy Type ${config.type} doesnt match with any registered types`); break;
        }
        if(enemy != undefined){
            enemy.key = config.data.key
            World.enemies.push(enemy)
        }
        
    }
}