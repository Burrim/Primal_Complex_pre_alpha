export default class AudioSystem{
    constructor(){
        this.currentBGM

        //List of Audioobjects
        this.SE = {}
        this.BGM = {}
    }
    init(){
        //Adds Soundeffects
        Object.keys(files.se).forEach(key => {
            if(key == 'config') return 

            let config = files.se.config[key]
            if(config == undefined) config = {}
            if(config.volume == undefined) config.volume = 1

            if(config.loop == undefined) config.loop = false

            this.SE[key] = {
                src : Setup.sound.add(key,{loop:config.loop}).setVolume(config.volume),
            }

            Object.assign(this.SE[key], config)
        })

        //Adds BGM
        Object.keys(files.bgm).forEach(key => {

            if(key == 'config') return 
            
            let config = files.bgm.config[key]
            if(config == undefined) config = {}
            if(config.volume == undefined) config.volume = 1
            
            
            this.BGM[key] = {
                src : Setup.sound.add(key,{
                    volume: config.volume,
                    loop: true
                }),
                //Callback for starting main BGM after intro ended
                startMain : function(){
                    this.src.play()
                    Audio.currentBGM = this.src
                }
            }
            this.BGM[key].startMain = this.BGM[key].startMain.bind(this.BGM[key])
            
            Object.assign(this.BGM[key], config)
    
            //Adds an intropart and a listener for starting the main part of the track after the intro ends
            if(config.intro){
                this.BGM[key].intro = Setup.sound.add(config.intro).setVolume(config.introVolume)
                this.BGM[key].intro.on('complete', this.BGM[key].startMain );
            }
        })
    }

    playSE(user,key,data){
        if(global.outOfFocus) return //Sound is not played when window isn't active to prevent sound buffering

        Setup.sound.stopByKey(key)

        let volume
        //sets default parameter
        let config = {
            minVolume: 0,
            maxVolume: 1,
            minDist: 0,
            maxDist: 1000,
            global: false
        }
        Object.assign(config, data)

        //Global Sound
        if(config.global) volume = config.maxVolume

        //Regional Sound
        else{
            //Calculate distance to Player
            let playerDis = Phaser.Math.Distance.BetweenPoints(user,player)
            //Player is inside the minimum distance => Full Volume
            if(playerDis < config.minDist) volume = config.maxVolume
            //player is inside range. Change volume according to distance
            else if(playerDis < (config.range + config.minDist)) volume = config.maxVolume * playerDis / ( config.range + config.minDist )
            else if(playerDis > config.maxDist) volume = 0
            else volume = config.minVolume
        }
        //this.SE[key].src.setVolume(volume * this.SE[key].volume)
        Setup.sound.play(key, {volume:volume * this.SE[key].volume})

        return this.SE[key].src
    }
    playBGM(key){
        
        if(this.currentBGM != undefined)
        this.currentBGM.stop()

        

        if(this.BGM[key].intro != undefined)
        this.currentBGM = this.BGM[key].intro 
        else 
        this.currentBGM = this.BGM[key].src 

        this.currentBGM.play()
    }
}