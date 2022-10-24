import EntityBase from './bases/EntityBase'

export default class HoverText extends EntityBase{
    constructor(config,props){
        super(config,props)

        this.props = props
        this.opacity = 0

        this.textActive = false

        this.elements = []
        this.test = World.add.text(0,0,'E',{fontFamily: 'Arial', fontSize: 16, color: '#000000',strokeThickness:1, stroke:'#000000' }).setDepth(10).setOrigin(0.5);
        this.elements.push(this.test)
        this.add(this.elements)

        //this.sprite.setVisible(false)
        World.physics.world.disable(this);
        
        this.interactDistance = 200
        World.updateEvents.push(this.AInew)

        this.states = []
        this.state = {}
    }

    genEvents(){
        this.playerDis = Phaser.Math.Distance.BetweenPoints(this,player)

        if(this.playerDis <= this.interactDistance && !this.textActive){
            this.textActive = true

            renderFloatingText(files.floatingTexts[this.props.targetGroup][this.props.targetElement])

            this.opacity = 0
            if(this.timer) this.timer.remove()
            this.timer = World.time.addEvent({
                delay: frame,                // ms
                callback: ()=>{
                    this.opacity += 100/10
                    document.getElementById('floatingTextContainer').style.opacity = `${this.opacity}%`
                },
                callbackScope: this,
                repeat: 9
            });
        }
        else if(this.playerDis > this.interactDistance && this.textActive){
            this.textActive = false
            this.opacity = 100
            if(this.timer) this.timer.remove()
            this.timer = World.time.addEvent({
                delay: frame,               
                callback: ()=>{
                    this.opacity -= 100/10
                    document.getElementById('floatingTextContainer').style.opacity = `${this.opacity}%`
                },
                callbackScope: this,
                repeat: 9
            });
        }
    }
}