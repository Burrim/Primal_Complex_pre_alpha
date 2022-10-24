// *** Imports **************************************************************************************************************************************************************************
import Phaser from 'phaser'

import processHit from '../system/processHit';
import createEnemy from '../system/EnemyGenerator';
import Player from '../entities/Player' 
import Item from '../entities/Item';
import Triggerpoint from '../entities/Triggerpoints';
import loadMap from '../system/loadMap';
import createParticle from '../system/createParticle';
import preAlphaInit from '../system/PreAlphaInit'
import HoverText from '../entities/HoverText';

//Imports Weapons
import Sword from '../data/weapons/Sword.js';

//Import Firearms
import EnergyShot from '../data/firearms/EnergyShot'

//Imports Techniques
import ChargerStrike from '../data/techniques/ChargerStrike';


// *** Setup ****************************************************************************************************************************************************************************

export default class World extends Phaser.Scene{
    constructor() {
        super({ key: 'World' });
        window.World = this
      }

      init(){
        this.updateEvents = []
      }

      create(){

        createParticle()

        //--- Creates Animations -------------
        if(global.player == undefined){ //Animations aren't removed by restarting a scene so reinitializing them is pointless
          this.animations = {}
          Object.keys(files.sprites).forEach(dir =>{
            Object.keys(files.sprites[dir].config).forEach(key =>{
              let config = Object.assign(files.sprites[dir].config[key])
              if(config.animation == undefined || config.animation == {}) return;
  
              //Creates object to insert out of config data and handles edge cases
              let anim =  Object.assign(config.animation) 
  
              //Generates Frames
              if(anim.frames == undefined) anim.frames = `${dir}-${key}` //Single Graphic
              else anim.frames = this.anims.generateFrameNames(`${dir}-${key}`, { frames: anim.frames }) //Multiple Frame Spritesheet
  
              anim.duration = config.animation.duration * frame
              anim.key = `${dir}-${key}`
  
              this.animations[`${dir}-${key}`] = this.anims.create(anim)
            })
          })

        }

        

        //Entity Groups
        this.projectiles = {
          image: [],
          sprite: [],
          circle: [],
          all: []
        }

        this.items = []
        this.enemies = []
        this.structures = []
        this.movingStructures = []
        this.floatingTexts = []
        this.interactables = []
        this.pistons = []
        this.animParticle = [] 

        //WIP
        this.orbs = []

        this.hitboxes = {
          circle: [],
          rectangle: [],
          all:[]
        }

        this.triggerpoints = [] //List of Trigger Objects
        this.lockedTrigger = {} //Id of triggers that are currently blocked are attached here

        this.lights.enable();
        this.lightList = []
        
        this.tempData = {} //Data that needs to be refreshed after every Mapload

        this.scene.launch('Background')
        this.scene.bringToTop(); //Places the World Scene above the Background Scene
        this.scene.launch('HUD')

        loadMap(this,selectedMap)
        this.loadEntities()



        //Sets Camera
        this.cameras.main.startFollow(player, true, 0.7, 0.7);
        this.cameras.main.setZoom(1.2)

        //Sets Collission Detection
        this.physics.world.TILE_BIAS = 48 //Makes it harder for Objects to clip trough walls
        this.physics.add.collider(player, this.map.meta);
        this.physics.add.collider(player, this.structures);
        this.physics.add.collider(player, this.movingStructures, (player,structure)=> {structure.touching.push(player)} );
        this.physics.add.collider(this.enemies, this.map.meta);
        this.physics.add.collider(this.enemies, this.enemies);
        this.physics.add.collider(this.enemies, this.structures);
        this.physics.add.collider(this.items, this.map.meta);
        this.physics.add.collider(this.interactables, this.map.meta);
        this.physics.add.collider(this.interactables, this.structures);
        this.physics.add.collider(this.interactables, this.movingStructures);

        this.physics.add.overlap(this.projectiles.all, this.map.meta, function(projectil,tile){if(tile.canCollide)projectil.collide()} )

        this.physics.add.overlap(this.projectiles.all, this.enemies, processHit)
        this.physics.add.overlap(this.hitboxes.all, this.enemies, processHit)
        this.physics.add.overlap(this.projectiles.all, player, processHit)
        this.physics.add.overlap(this.hitboxes.all, player, processHit)
        this.physics.add.overlap(this.triggerpoints, player, function(triggerpoint){triggerpoint.trigger()})
        this.physics.add.overlap(this.triggerpoints, this.enemies, function(triggerpoint,enemy){if(triggerpoint.key =="deathzone") enemy.die()})
      
        //Beta
        this.physics.add.overlap(this.orbs, player, (orb,player)=>{
          if(!player.indestructible)
          {
            if(player.defense == 100){
              player.blockHit(20)
              orb.die();
            }else{
              
              Audio.playSE(player,'impact',{global:true})
              player.takeDamage(20)
              orb.die();
            }
          }
        })
        this.physics.add.overlap(this.hitboxes.all, this.orbs, (hitbox,orb)=>{ if(hitbox.active)orb.die()})
        

        this.physics.add.overlap(this.hitboxes.all, this.projectiles.all, function(hitbox,projectil){projectil.deflect(hitbox)})
        this.physics.add.overlap(this.items, player, function(item,player){item.onPickup()})

        //Lighting
        SaveManager.load()
        preAlphaInit()

      }

    // *** Load Entities ************************************************************************************************************************

    loadEntities(reload){
       //Loads all predefined Objects
       this.map.objects.forEach(item =>{

        switch(item.data.type){

          case "player":
          if(reload) return
          
          global.player = new Player({scene:this, x:item.position.x,y:item.position.y},{})
          player.weapon = new Sword()
          player.weapon.applyMod('Default')
          player.fireArm[0] = new EnergyShot(0)
          player.techniques[0] = new ChargerStrike()
          player.techniques[0].assign = 1
          player.fireArm[1] = new EnergyShot(1)
          player.techniques[1] = new ChargerStrike()
          player.techniques[1].assign = 2
          
          this.playerlight = this.lights.addLight(item.position.x, item.position.y, 100, '0xffffff', 1);
          this.hurtlight = this.lights.addLight(item.position.x, item.position.y, 1000, '0xff0000', 0);
          
          this.backlighto = this.add.image(item.position.x, item.position.y, 'particle-dark').setPipeline('Light2D').setAlpha(0.2).setDepth(-5)
          break; 

          case 'enemy': case 'prop': case 'structur': 
          createEnemy(item)
          break;

          case 'item':
          let itemObj = new Item({x:item.position.x, y:item.position.y, spriteKey:item.data.spriteKey},item.data.props)
          itemObj.init()
          this.items.push(itemObj)
          break;

          case 'light':
          if(reload) return

          let lightObj = {
            src : this.lights.addLight(item.position.x, item.position.y, parseInt(item.data.props.size), item.data.props.color, parseInt(item.data.props.intensity)),
            key : item.data.props.key
          }
          this.lightList.push(lightObj)

          if(item.data.props.disabled && item.data.props.disabled != 'false') lightObj.src.setVisible(false)
          break;

          case 'triggerpoint':
          let triggerpoint = new Triggerpoint(item.position, item.data.props) 
          this.triggerpoints.push(triggerpoint)
          break;

          case 'injection':
            let tile = this.map.core.getTileAtWorldXY(item.position.x, item.position.y, true, this.cameras.main, 'meta')
            tile[item.data.props.key] = true
          break;

          case 'hoverText':
            let hoverText = new HoverText({scene:this,x:item.position.x,y:item.position.y},item.data.props)
            this.enemies.push(hoverText)
          break;

          case 'wraithTeleport':
            if(this.wraithTPs == undefined) this.wraithTPs = []
            this.wraithTPs.push(item.position)
          break;



        }
      })
    }

    // *** Update ************************************************************************************************************************

      update(){

         //Ugly Fix for pseudo AI for moving Structures. make a proper Class with Update Logic in the future
         this.movingStructures.forEach(struc => {
          //struc.touching = []
        })

        Input.updatePreCycle()
        this.updateEvents.forEach(event =>{
          event()
        })
        Input.updatePostCycle()
        
        this.playerlight.x = player.x
        this.playerlight.y = player.y
        this.backlighto.x = player.x
        this.backlighto.y = player.y
        this.hurtlight.x = player.x
        this.hurtlight.y = player.y

        if(this.activeBoss){
          this.bosscamera.x = player.x + (this.activeBoss.x - player.x)/2
          this.bosscamera.y = player.y
        }

       
      }

       //*** Functions *******************************************************************************************************************

       setLights(key, config){ 
        this.lightList.forEach(light => {
          if(light.key == key){
            if(config.radius != undefined) light.src.setRadius(config.radius)
            if(config.color != undefined) light.src.setColor(config.color)
            if(config.intensity != undefined) light.src.setIntensity(config.intensity)
            if(config.visible != undefined) light.src.setVisible(config.visible)
          }
        })

      }

      lightsOff(){
        this.setLights('tower',{radius:0})
        Background.img[0].setAlpha(0.3)
      }

      towerLightOn(){
        if(global.towerIsOn) return
        this.time.delayedCall(60*frame, function(){ 
          //Tower Lights
          this.setLights('tower',{visible:true})
          Audio.playSE(player,'transition',{global:true})
          Background.img[2].setAlpha(0.8)
        this.time.delayedCall(30*frame, function(){ 
          //Tower 1
          this.setLights('tower1',{visible:true})
          Background.img[2].setAlpha(0.5)
          Audio.playBGM('TowerActive')
          
        this.time.delayedCall(30*frame, function(){ 
          //Tower 2
          this.setLights('tower2',{visible:true})
          Background.img[2].setAlpha(0)
        this.time.delayedCall(60*frame, function(){
          //Enemies
          this.enemies.forEach(enemy => {
            if(enemy.active) enemy.disabled = false
          })

        },null, this)
        },null, this)
        },null, this)
        },null, this)

        //Turns on Piston Controller
        this.interactables.forEach(element => {
          if(element.structureType == "pistonController")
          element.active = true
          element.sprite.setFrame(1)                
      });
        global.towerIsOn = true
      }

      towerOnShort(){
        this.setLights('tower',{visible:true})
        this.setLights('tower1',{visible:true})
        this.setLights('tower2',{visible:true})
        
        Audio.playBGM('TowerActive')
        this.enemies.forEach(enemy => {
          if(enemy.active) enemy.disabled = false
        })
        this.interactables.forEach(element => {
          if(element.structureType == "pistonController")
          element.active = true
          element.sprite.setFrame(1)                
      });
      this.time.delayedCall(10*frame, function(){ Background.img[2].alpha = 0 },null, this)
      }

      startBossCamera(boss){
        this.activeBoss = boss
        this.bosscamera = this.add.rectangle(player.x,player.y,1,1,0x000000).setVisible(false)
        this.cameras.main.startFollow(this.bosscamera, true, 0.2, 1);
      }

      pistonControl(tag,silent){
        this.pistons.forEach(piston => {
          if(piston.tag == tag) piston.move(silent)
        })
      }

}