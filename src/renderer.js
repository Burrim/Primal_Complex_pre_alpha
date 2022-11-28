import './index.css';
import './assets/fonts/oswald_stylesheet.css'
import Setup from './scenes/Setup'
import World from './scenes/World'
import Background from './scenes/Background';
import HUD from './scenes/HUD';

import InputManager from './system/InputManager'
import SaveManager from './system/SaveManager';

import Phaser from 'phaser'

import loadingScreen from './assets/sprites/ui/loading2.png'
import React from 'react'
import ReactDOM from 'react-dom'

import FloatingText from './components/FloatingText';
// *** Asset Loader *************************************************************************************************

//General dynamic import function
function importAll(r) { 
  let images = {};
  r.keys().map( item => { images[item.replace(/.\//, '')] = r(item); });
  return images;
}

//Container for all loaded Files
window.files = { 
  tilesets:{},
  sprites:{all:{}},
  maps:{}, 
  particles : {},
  graphics : {},
  backgrounds: {},
  se: {},
  bgm: {}
}

// *** Tilesets ***
//Loads all tileset graphics
let tilesets = importAll(require.context(`../src/mapData/tilesets/`, true, /.(png)$/));
Object.keys(tilesets).forEach(key =>{
  files.tilesets[key.replace(/.(png|json)/,'')] = tilesets[key]
})


let backgrounds = importAll(require.context(`../src/assets/backgrounds/`, true, /.(png|jpe?g|svg|json)$/));
Object.keys(backgrounds).forEach(key =>{
  files.backgrounds[key.replace(/.(png|json)/,'')] = backgrounds[key]
})

// *** Sprites ***
//Imports all sprites and stores them in a general variable
files.sprites.all = importAll(require.context(`../src/assets/sprites/`, true, /.(png|jpe?g|svg|json)$/));

//Takes the individual sprite files which where already loaded and puts them in their corresponding places for ease of access
Object.keys(files.sprites.all).forEach(key =>{
  let dir = key.substring(0, key.indexOf('/'));
  let item = key.substring(key.indexOf('/')+1, key.length)

  if(!files.sprites[dir]) files.sprites[dir] = {}
  files.sprites[dir][item.replace(/.(png|json)/,'')] = files.sprites.all[`${dir}/${item}`]
})

delete files.sprites.all

// *** Soundeffects ***
//Loads all Soundeffects
let SEs = importAll(require.context(`../src/assets/se/`, true, /.(ogg|json)$/));
Object.keys(SEs).forEach(key =>{
  files.se[key.replace(/.(ogg|json)/,'')] = SEs[key]
})

// *** Background music ***
//Loads all BGMS
let BGMs = importAll(require.context(`../src/assets/bgm/`, true, /.(ogg|json)$/));
Object.keys(BGMs).forEach(key =>{
  files.bgm[key.replace(/.(ogg|json)/,'')] = BGMs[key]
})

// *** Particles ***
//Loads all tileset graphics
let particles = importAll(require.context(`../src/assets/particles/`, true, /.(png|jpe?g|svg|json)$/));
Object.keys(particles).forEach(key =>{
  files.particles[key.replace(/.(png|json)/,'')] = particles[key]
})

//*** Floating Texts *** 
files.floatingTexts = {}
let texts = importAll(require.context(`../src/data/floatingTexts`, true, /.(png|jpe?g|svg|json)$/));
Object.keys(texts).forEach(key =>{
  files.floatingTexts[key.replace(/.(png|json)/,'')] = texts[key]
})

// *** Maps ***

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// !!! For Production Imports need to be active, for Development File System loading needs to be enabled. Problems with import necessity in production and memory overflow in development respectively !!!
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Imports all map files


/*
let maps = importAll(require.context(`../src/mapData/maps`, true, /.(png|jpe?g|svg|json)$/));
Object.keys(maps).forEach(key =>{
  files.maps[key.replace(/.(png|json)/,'')] = maps[key]
})
*/

// *** PLACEHOLDER ***
//Since i've not found out a way to increase the memory limit of webpack I need to use this since reading maps with the filesystem doesn't seem to increase the memory load

//Checks Directory for Files


let maps = fs.readdirSync("./src/mapData/maps")
//let maps = fs.readdirSync("./maps")

maps.forEach(key => {
  //Load individual Files
  let map = JSON.parse( fs.readFileSync("./src/mapData/maps/"+key)) 
  //let map = JSON.parse( fs.readFileSync("./maps/"+key))
  files.maps[key.replace(/.(json)/,'')] = map
})




// *** General Globals **********************************************************************************************

global.frame = 1000/60 
global.id = 0
global.selectedMap = 'TestRoom' 

global.assignId = function(){
  global.id++;
  return global.id
}

//*** REACT *********************************************************************************************************/

 //Tilesetwindow
 window.renderFloatingText = function(elements){
  ReactDOM.render(
      <FloatingText elements={elements}/> 
    ,document.getElementById("floatingTextContainer"));
}


// *** Game Config **************************************************************************************************
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scale: 
    {
      //mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    //backgroundColor: "#181818",
    backgroundColor: '#000000',
    parent: 'parent',
    dom: {
      createContainer: true
  },
    scene: [Setup, World,Background, HUD],
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 1200 }, 
        debug: false
      }
    }
  };

class Game extends Phaser.Game {
    constructor() {
      super(config);
    }
  }
  


window.Game = new Game(); 

global.Input = new InputManager()
global.SaveManager = new SaveManager()

