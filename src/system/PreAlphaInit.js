

export default function preAlphaInit(){
    switch(global.selectedMap){
        case 'TestRoom':
            if(global.portalCheckpoint != undefined){
                player.setPosition(portalCheckpoint.x,portalCheckpoint.y)
            }
            World.enemies.forEach(enemy => {
                if(enemy.key == 'fodder'){
                    enemy.hp = 9999999999
                    enemy.maxHp = 9999999999
                    enemy.attacks.closeAttack.hitboxParam.attack.power = 0
                    enemy.disableHealthbar = true
                }
            })

            World.enemies.forEach(enemy => {
                if(enemy.key == 'turret'){
                    enemy.hp = 1
                    enemy.maxHp = 1
                    enemy.weapons.stationaryBlast.prjParam.attack.power = 1
                }
            })

            let levels = ['Freeroam','OutsideCombat', 'Parcour','Scrapyard', 'TestRoom','Tower']
            levels.forEach(level => {
                if(JSON.parse(localStorage.getItem(level+'-completed'))){
                
                    World.interactables.forEach(interactable =>{

                        if(interactable.props.destination == level){
                            let star = World.add.sprite(interactable.x,interactable.y -64,'particle-Star_005')
                            star.scaleX = 1/12; star.scaleY = 1/12; star.setTint('0xf21351') 

                        }
                    })
                }
            })

        break;
        case 'Tower':
            World.pistonControl('defaultActive',true)
            World.interactables.forEach(element => {
                if(element.structureType == "pistonController"){
                    element.active = false             
                }
            });

            if(global.towerIsOn) World.towerOnShort()
        break;

        case 'Scrapyard':
            World.backlighto.setAlpha(0.2)
            World.playerlight.intensity = 0

            World.gameFinishUpdate = function(){
                World.redScreen.setPosition(player.x,player.y)
                particles.wraithDie.emit(World.wraith.x,World.wraith.y)
            }

            
        break;
    }
}