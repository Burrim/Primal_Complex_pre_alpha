
import Phaser from 'phaser'


export default class HUD extends Phaser.Scene{
    constructor(){
        super({key: 'HUD'});
        window.HUD = this
    }

    create(){
        this.scene.bringToTop();

        this.healthbar = this.add.rectangle(20,20,300,12,0xf21351).setOrigin(0)
        this.healthbarBorder = this.add.rectangle(20,20,300,12).setStrokeStyle(2,0x000000).setOrigin(0)
        this.healtbarMarker = this.add.rectangle(320,26,1,16,0xf21351 )

        this.healthbarTick1 = this.add.rectangle(20,20,50,12).setStrokeStyle(2,0x000000).setOrigin(0)
        this.healthbarTick2 = this.add.rectangle(20,20,100,12).setStrokeStyle(2,0x000000).setOrigin(0)
        this.healthbarTick3 = this.add.rectangle(20,20,150,12).setStrokeStyle(2,0x000000).setOrigin(0)
        this.healthbarTick4 = this.add.rectangle(20,20,200,12).setStrokeStyle(2,0x000000).setOrigin(0)
        this.healthbarTick5 = this.add.rectangle(20,20,250,12).setStrokeStyle(2,0x000000).setOrigin(0)
        
        this.extraLives = []

        this.energybar = this.add.rectangle(20,40,200,12,0x50cfe6).setOrigin(0)
        this.energybarBorder = this.add.rectangle(20,40,200,12).setStrokeStyle(2,0x000000).setOrigin(0)
        this.energyMarker = this.add.rectangle(220,46,1,16,0x50cfe6 )

        this.energybarTick1 = this.add.rectangle(20,40,50,12).setStrokeStyle(2,0x000000).setOrigin(0)
        this.energybarTick2 = this.add.rectangle(20,40,100,12).setStrokeStyle(2,0x000000).setOrigin(0)
        this.energybarTick3 = this.add.rectangle(20,40,150,12).setStrokeStyle(2,0x000000).setOrigin(0)

        this.renderExtraLives()

        this.loading = this.add.image(0,0,'ui-loading').setOrigin(0).setVisible(false)
        this.loading2 = this.add.image(0,0,'ui-loading2').setOrigin(0).setVisible(false)
        this.thankyou = this.add.image(640,360,'ui-thankYou').setOrigin(0.5).setAlpha(0)

    }

    renderExtraLives(){
        for(let i = 0; i < player.maxExtraLives; i++){
            if(!this.extraLives[i])
            this.extraLives[i] = this.add.rectangle(325 + i*13 ,20,8,12,0xf21351 ).setOrigin(0)

            if(i < player.extraLives)
            this.extraLives[i].setStrokeStyle(0,0x000000).setFillStyle(0xf21351)
            else 
            this.extraLives[i].setStrokeStyle(1,0x000000).setFillStyle()
            
            
        }
    }

    fade(){
        this.tweens.add({
            targets:[this.healthbar,this.healthbarBorder,this.healtbarMarker,this.healthbarTick1,this.healthbarTick2,this.healthbarTick3,this.healthbarTick4,this.healthbarTick5,this.energybar,this.energybarBorder,this.energyMarker,this.energybarTick1,this.energybarTick2,this.energybarTick3],
                alpha: 0,
                duration: 600*frame,
            })

    }
    

    update(){
        if(!player) return 
        
        //Adjust HP Bar
        this.healthbar.scaleX = player.hp / player.maxhp
        this.healtbarMarker.setPosition(20 + 300*(player.hp / player.maxhp),26)

        //Adjust Energy Bar
        this.energybar.scaleX = player.energy / player.maxenergy
        this.energyMarker.setPosition(20 + 200*(player.energy / player.maxenergy),46)
    }
}