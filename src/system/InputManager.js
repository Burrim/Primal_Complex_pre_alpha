import Phaser from 'phaser'

export default class InputManager{
    constructor(){

// *** General Init ********************************************************************************************************

        //Empty Objects for all inputs, gets filled with the respective entry as soon as an input is triggered
        this.keyList = []
        this.trigger = {keyboard:{}, gamepad:{}}
        this.keyboard = {}
        this.gamepad = {}
        this.gamepadSticks = {
            left:{x:undefined,y:undefined},
            right:{x:undefined,y:undefined}
        }

        this.activeInput = 'keyboard'
        
        this.stickSens = 0.5 //Deadzone for stickinput
        this.gamepadIndex; //Index of active gamepad

        this.config = {
            left:{ keyboard:["ArrowLeft"], gamepad:["left",'LStickLeft'], buffer:true, analog:true},
            right:{ keyboard:["ArrowRight"], gamepad:["right",'LStickRight'], buffer:true, analog:true},
            up:{ keyboard:["ArrowUp"], gamepad:["up",'LStickUp'], buffer:true},
            down:{ keyboard:["ArrowDown"], gamepad:["down", 'LStickDown'], buffer:true},
            block: { keyboard:["Control"], gamepad:["Y"], buffer:true},
            jump:{ keyboard: [" "], gamepad:["A"], buffer:false},
            attack:{ keyboard: ["e"], gamepad:["X"], buffer:true},
            dash:{ keyboard: ["Shift"], gamepad:["B"], buffer:true},
            shoot:{ keyboard: ["q"], gamepad:["L1","R1"], buffer:false},
            special1:{ keyboard: [], gamepad:[], buffer:true},
            special2:{ keyboard: [], gamepad:[], buffer:true},
            secLeft:{ keyboard:["a"], gamepad:["RStickLeft"], buffer:true},
            secRight:{ keyboard:["d"], gamepad:["RStickRight"], buffer:true},
            secUp:{ keyboard:["w"], gamepad:["RStickUp"], buffer:true},
            secDown:{ keyboard:["s"], gamepad:["RStickDown"], buffer:true},
        }

     

        this.uppercaseInputs = ['Q','W','E','R','T','Z','U','I','O','P','A','S','D','F','G','H','J','K','L','Y','X','C','V','B','N','M']
        this.lowercaseInputs = ['q','w','e','r','t','z','u','i','o','p','a','s','d','f','g','h','j','k','l','y','x','c','v','b','n','m']
        
        //Input Buffer
        this.buffer = {}

        //List of all Inputs that need to be buffered. 
        this.bufferList = []
        this.bufferDuration = 10

        Object.keys(this.config).forEach(key => {

            //Creates hold function
            this[key+'Hold'] = function(){
                let value = false
                //Checks For every value that is defined as possible input if it is active
                for(let i = 0; i< this.config[key][this.activeInput].length; i++){
                    if(this[this.activeInput][this.config[key][this.activeInput][i]]){
                        value = this[this.activeInput][this.config[key][this.activeInput][i]];
                        break;
                    }
                }

                if(this.config[key].analog){
                    if(value === true) value = 1
                }
                return value
            }

            //Creates trigger function
            this[key+'Trigger'] = function(){
                let value = false
                for(let i = 0; i < this.config[key][this.activeInput].length; i++){
                    if(this.trigger[this.activeInput][this.config[key][this.activeInput][i]] || this.buffer.key == key+'Hold'){
                        value = true;
                        this.buffer = {} //Clears Buffer
                        break;
                    }
                }
                return value
            }

            if(this.config[key].buffer) this.bufferList.push(key+'Hold')
            
            
        })

// *** Gamepad mapping ********************************************************************************************************

        //Assigns buttons to values that get returned by the gamepad API. Is used to give all the different controllers the same effective layout
        this.gamepadMapping = {
            "Xbox 360 Controller (XInput STANDARD GAMEPAD)":{
                up : 12,
                down: 13,
                left: 14,
                right: 15,
                A: 0,
                B: 1,
                X: 2,
                Y: 3,
                R1: 5,
                R2: 7,
                L1: 4,
                L2: 6
            },
            "Default":{
                up : 12,
                down: 13,
                left: 14,
                right: 15,
                A: 0,
                B: 1,
                X: 2,
                Y: 3,
                R1: 5,
                R2: 7,
                L1: 4,
                L2: 6
            }
        }

// *** Listeners ********************************************************************************************************

        //Resets all Inputs when window loses focus
        addEventListener('blur', event => {
            global.outOfFocus = true
            this.keyList.forEach(key => {
                this[key] = false
            })
            this.trigger = {keyboard:{}, gamepad:{}}
            this.buffer = {}

        });


        //Resets all Inputs when window loses focus
        addEventListener('focus', event => {
            global.outOfFocus = false
        });

        //Listeners für keypresses
        window.addEventListener('keydown', (e) => {
            let key = this.transformToLowercase(e.key)

            if(this.keyboard[key] == true) return
            this.keyboard[key] = true
            this.keyList.push(key) //Logs keys, so the blur event knows what to erase
            this.trigger.keyboard[key] = true
            this.activeInput = 'keyboard'
        });

        window.addEventListener('keyup', (e) => {
            this.keyboard[this.transformToLowercase(e.key)] = false
        });

        //Listener for Gamepad connections
        window.addEventListener("gamepadconnected", (e) => {
            console.log(`Gamepad with id ${e.gamepad.id} connected`)
          });

        //Clears active gamepad on disconnect
        window.addEventListener("gamepaddisconnected", function(e) {
            console.log("Gamepad disconnected")
          });
    }

// *** Functions ****************************************************************************************************************



// *** Update Functions  ********************************************************************************************************

    updatePreCycle(){
        this.queryGamepad()
        this.setBuffer()
    }
    updatePostCycle(){
        this.resetTrigger()
    }

    //Writes Gamepad Inputs 
    queryGamepad(){

        try{

        //Fetches every gamepad and checks inputs. if any input is active said gamepad is set to listen to
        let gamepads = navigator.getGamepads()
        for(let i = 0; i < 3; i++){
            if(gamepads[i] != null ){
                
                //Checks Buttons
                let length = Object.keys(gamepads[i].buttons).length
                for(let j = 0; j < length; j++){
                    if(gamepads[i].buttons[j].pressed){
                        this.gamepadIndex = i
                        this.activeInput = 'gamepad'
                        break;
                    }
                }
                //Checks Sticks
                gamepads[i].axes.forEach(value =>{
                    if(value > this.stickSens || value < -this.stickSens){
                        this.gamepadIndex = i
                        this.activeInput = 'gamepad'
                    } 
                })
            } 
        }

        if(this.gamepadIndex == undefined) return
        this.activeGamepad = gamepads[this.gamepadIndex]

        //Checks if a proper mapping for the gamepad is configured, otherwise assign default values.
        let mapping
        if( Object.keys(this.gamepadMapping).includes(this.activeGamepad.id ))
        mapping = this.gamepadMapping[this.activeGamepad.id]
        else mapping = this.gamepadMapping.Default

        Object.keys(mapping).forEach(key =>{

            //Sets trigger state of key but only if the key wasn't held last frame
            if(!this.gamepad[key]) 
            this.trigger.gamepad[key] = this.activeGamepad.buttons[mapping[key]].pressed
            
            //Sets hold state of key
            this.gamepad[key] = this.activeGamepad.buttons[mapping[key]].pressed
        })

        // Gamepad Sticks
        let value

        //Left Stick
        value = this.gamepad.LStickRight = this.getAxisvalue(this.activeGamepad.axes[0],'positive')
        if(!this.gamepad.LStickRight && value) this.trigger.gamepad.LStickRight = true 
        this.gamepad.LStickRight = value

        value = this.gamepad.LStickLeft = this.getAxisvalue(this.activeGamepad.axes[0],'negative')
        if(!this.gamepad.LStickLeft && value) this.trigger.gamepad.LStickLeft = true 
        this.gamepad.LStickLeft = value

        value = this.gamepad.LStickUp = this.getAxisvalue(this.activeGamepad.axes[1],'negative')
        if(!this.gamepad.LStickUp && value) this.trigger.gamepad.LStickUp = true 
        this.gamepad.LStickUp = value

        value = this.gamepad.LStickDown = this.getAxisvalue(this.activeGamepad.axes[1],'positive')
        if(!this.gamepad.LStickDown && value) this.trigger.gamepad.LStickDown = true 
        this.gamepad.LStickDown = value

        //Right Stick
        value = this.gamepad.RStickRight = this.getAxisvalue(this.activeGamepad.axes[2],'positive')
        if(!this.gamepad.RStickRight && value) this.trigger.gamepad.RStickRight = true 
        this.gamepad.RStickRight = value

        value = this.gamepad.RStickLeft = this.getAxisvalue(this.activeGamepad.axes[2],'negative')
        if(!this.gamepad.RStickLeft && value) this.trigger.gamepad.RStickLeft = true 
        this.gamepad.RStickLeft = value

        value = this.gamepad.RStickUp = this.getAxisvalue(this.activeGamepad.axes[3],'negative')
        if(!this.gamepad.RStickUp && value) this.trigger.gamepad.RStickUp = true 
        this.gamepad.RStickUp = value

        value = this.gamepad.RStickDown = this.getAxisvalue(this.activeGamepad.axes[3],'positive')
        if(!this.gamepad.RStickDown && value) this.trigger.gamepad.RStickDown = true 
        this.gamepad.RStickDown = value



        this.gamepadSticks = {
            left: {
                x: this.activeGamepad.axes[0],
                y: this.activeGamepad.axes[1]
            },
            right:{
                x: this.activeGamepad.axes[2],
                y: this.activeGamepad.axes[3], 
            }
        }
    }
    catch(error){}
     }

    //Needs to be executed after all player Actions at the end of the update cycle, resets inputs that were set as trigger this frame
    resetTrigger(){
        if(this.trigger == {})return
            Object.keys(this.trigger.keyboard).forEach(key =>{
                this.trigger.keyboard[key] = false
            })
        if(this.activeGamepad != undefined){
            Object.keys(this.trigger.gamepad).forEach(key =>{
                this.trigger.gamepad[key] = false
            }) 
        }
    }

    setBuffer(){
        //Ticks down buffer duration and clears if the countdown reaches 0
        if(this.buffer != {}){
            this.buffer.duration--

            if(this.buffer.duration <= 0)
            this.buffer = {}
        }

        //checks every input for potential new buffer to create
         this.bufferList.forEach(key => {
            if(this[key]()) this.buffer = {key:key,duration:this.bufferDuration}
         })
    }

    transformToLowercase(key){
        //Checks if key is in the uppercase list and switches it to its lower case paralell if true.
        if(this.uppercaseInputs.includes(key)){
            return this.lowercaseInputs[this.uppercaseInputs.indexOf(key)]
        }
        else return key
    }

    getAxisvalue(axis,sign){
        let value
        switch(sign){
            case 'positive': value = Math.max(axis,0); break;
            case 'negative': value = Math.min(axis,0); break;
        }
        value = Math.max(0,Math.abs(value) - this.stickSens) / (1-this.stickSens)
        return value
    }


    // *** Input Reader Functions  ********************************************************************************************************
    
    secActive() {if(this.secLeftHold() || this.secRightHold() || this.secDownHold() || this.secUpHold()) return true}
}