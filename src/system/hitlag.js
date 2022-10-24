

export default function hitlag(duration,bleedDuration){

    if(bleedDuration > 0){
        World.hurtlight.intensity = 2
        setTimeout(()=>{World.hurtlight.intensity = 0}, bleedDuration*frame);
    }

    World.scene.pause('World')
    setTimeout(()=>{World.scene.resume('World')}, duration*frame);
}