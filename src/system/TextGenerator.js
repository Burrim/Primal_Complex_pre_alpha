import reactivateInactive from "./reactivateInactive";

export default function createText(config){

    let text = reactivateInactive(World.floatingTexts, config.x,config.y)

    let textSize = 16
    if(config.size) textSize = config.size

    let textColor = '#ffffff'
    if(config.color) textColor = config.color

    if(!text){
        //Create new textobject
        text = World.add.text(config.x, config.y, config.text, { fontSize: textSize, color: textColor, fontFamily: '"oswaldregular"' }).setZ(5)
    }

    text.tween = World.tweens.add({
        targets: text,
        alpha: 0,
        ease: 'Power1',
        duration: 15*frame,
        delay: 30*frame,
    });



}