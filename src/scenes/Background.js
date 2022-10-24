
import Phaser from 'phaser'


export default class Background extends Phaser.Scene{
    constructor(){
        super({key: 'Background'});
        window.Background = this
    }

    create(){
        this.img = []
        this.settings = []

        files.maps[selectedMap].backgrounds.forEach(entry => {
            let bg = this.add.image(Game.scale.baseSize.width,Game.scale.baseSize.height,entry.id).setOrigin(0).setScale(entry.scaleFactor)
            this.img.push(bg)
            this.settings.push(entry)
        }); 
    }
    update(){
        let relPos = {
            x: player.x / World.map.core.widthInPixels,
            y: player.y / World.map.core.heightInPixels
        }
        this.img.forEach((entry,index) => {
            entry.setPosition(
                -(entry.width * this.settings[index].scaleFactor - Game.scale.baseSize.width) * relPos.x,
                -(entry.height * this.settings[index].scaleFactor - Game.scale.baseSize.height) * relPos.y,
            )
        })
    }
}