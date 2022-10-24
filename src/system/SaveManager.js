
/*
Very Beta for the time being. Only saves in to a temporary slot that gets cleared after every level switch
*/


export default class SaveManager{
    constructor(){
        this.slot = 1; //Selected Save Slot
        this.saveGame = {};
    }
    save(){
        this.saveGame.player = {
            x : player.x,
            y : player.y,
        }
        //!!! For the alpha 1.1 build every time a teleporter gets used the savegame is cleared
        
        //fs.writeFileSync(`./src/data/saveGames/saveslot${this.slot}.json`, JSON.stringify(this.saveGame,null,2))
    }
    load(){
        //this.saveGame = JSON.parse(fs.readFileSync(`./src/data/saveGames/saveslot${this.slot}.json`))
        Object.assign(player, this.saveGame.player)
    }

    
}