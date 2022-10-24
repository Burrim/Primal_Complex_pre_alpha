import playParticleAnimation from "./playParticleAnimation"

export default function createParticle(){
    global.particles = {}

    //Deletes all peviously generated animations if this function was called because of a file refresh
    //if(global.player == undefined) Object.keys(World.anims.anims.entries).forEach(key => World.anims.remove(key))

    //Goes trough every file in the particles Folder
    Object.keys(files.particles).forEach(key => {

      let file = files.particles[key]

      let particle = {
          props: file.props,
          emitter:{},
          particleSrc:{},
          particles:[],
          animations: [],
          animationSrc: {},
          emit: function(x,y,config){
            //Trigger all particle emitter
            this.particles.forEach(element =>{
              element.emitParticleAt(x+element.emitters.list[0].posOffset.x,y+element.emitters.list[0].posOffset.y)
            })

            //Trigger all animations
            this.animations.forEach(element =>{
              playParticleAnimation(x,y,element.key,element.duration,element.tint,config)
            })
          }
      }
      
      //Goes trough every component inside the file 
      file.list.forEach(data => {

      let config = Object.assign(data) //Copy Data to usable object

// ----- Creates Particle Emitter ----------------------------------------------------------------------------------------------------------------------
        if(data.type == 'particle'){
          
        //Seting up default Values
        config.on = false

        //translate Emit zone from json to usable config
        if(config.emitZone != undefined){
          config.emitZone = {
            source: new Phaser.Geom.Rectacle(config.emitZone.source[0],config.emitZone.source[1],config.emitZone.source[2], config.emitZone.source[3]),
            type : config.emitZone.type
        }}

        //Translates tint to a usable format
        if(config.tint) eval(`config.tint = ${config.tint}`)
        

        //Adding the phaser particle objects to the main container
        particle.particleSrc[config.id] = World.add.particles(config.texture)
        particle.particles.push(particle.particleSrc[config.id])
        particle.emitter[config.id] = particle.particleSrc[config.id].createEmitter(config)

        //Adds additional properties outside of the constructor
        if(config.posOffset){
          particle.emitter[config.id].posOffset = config.posOffset
        } else particle.emitter[config.id].posOffset = {x:0,y:0}
      
      }

// ----- Creates Animation ----------------------------------------------------------------------------------------------------------------------

      else if(data.type == 'animation'){

        config.key = config.id
        if(config.frames == undefined) config.frames = config.src

        config.duration = config.duration * frame


        //Sets up full Duration which can be specified if the animation should play more than just once
        if(!config.fullDuration) config.fullDuration = config.duration
        //else config.fullDuration *= frame

        if(config.tint) eval(`config.tint = ${config.tint}`)
        if(!config.posOffset) config.posOffset = {x:0,y:0}
      
        particle.animationSrc[config.id] = {
          key: config.key,
          duration: config.fullDuration*frame,
          tint: config.tint,
          posOffset: config.posOffset,
          anim: Setup.anims.create(config)
        }
        particle.animations.push(particle.animationSrc[config.id])
      }
  })

// ----- End of Loop -----------------------------------------------------------------------------------------------------------------------------

        global.particles[key] = particle //Links the full Particle Object with all emitters and animations to the global object

    })
    
}