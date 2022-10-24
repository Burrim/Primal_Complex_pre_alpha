import Phaser from 'phaser'
import AudioSystem from '../system/AudioSystem';
import createParticle from '../system/createParticle';

export default class Setup extends Phaser.Scene{
    constructor() {
        super({ key: 'Setup' });
        window.Setup = this
      }

// *** Preload ************************************************************************************************************************

      preload(){
        //Loads Tilesetimages in to Phaser
        Object.keys(files.tilesets).forEach(key => {
            this.load.image(key, files.tilesets[key])
          })

        //Loads Backgroundimahes in to Phaser
        Object.keys(files.backgrounds).forEach(key => {
          this.load.image(key, files.backgrounds[key])
        })

        //Loads Sprites in to Phaser
          Object.keys(files.sprites).forEach(dir=>{
            Object.keys(files.sprites[dir]).forEach(key =>{
                if(key == 'config') return;
                if(files.sprites[dir].config[key] == undefined)
                this.load.image(`${dir}-${key}`, files.sprites[dir][key])
                else {
                this.load.spritesheet(`${dir}-${key}`, files.sprites[dir][key], files.sprites[dir].config[key].load)
                }
            })
          })

        //Loads Mapfiles in to Phaser
        Object.keys(files.maps).forEach(key => {
            this.load.tilemapTiledJSON(key, files.maps[key])
          })

        //Loads Soundeffects
        Object.keys(files.se).forEach(key => {
          if(key == 'config') return
          this.load.audio(key,files.se[key])
        })

        //Loads Background Music
        Object.keys(files.bgm).forEach(key => {
          if(key == 'config') return
          this.load.audio(key,files.bgm[key])
        })
      }

// *** Create ******************************************************************************************************************************

      create(){
          this.scene.launch('World')
          global.Audio = new AudioSystem()
          Audio.init()
          
      }

// *** Functions ***************************************************************************************************************************

      loadMap(map){
        selectedMap = map
        Background.scene.stop('Background')
        World.scene.restart('World')
      }

      restart(){
        World.scene.shutdown('World')
        World.scene.start('World')
      }

}