
import Weapon from "./WeaponsBlueprint";

export default class Sword extends Weapon{
    constructor(){
        super();

        this.type = 'Sword' //Gets to choose the right version of any selected mod

        this.groundSideStats = {
            startup: 5,
            duration: 15,
            cooldown: 20,
            animation: "alphaCharacter-Attack1",
            slashAnim: {key: 'slash-SlashV5', width: 1, height: 1},
            se: {key: 'swing'},
            hitbox: 'BasicArcSlash',
            hitboxParam: {
                flipSensitive: true,
                user: player,
                attack:{
                    power: 30,
                    knockback: 10,
                    particle: "slashHit",
                    penetration: 20
                }
            }
        }

        this.groundUpStats = {
            startup: 10,
            duration: 15,
            cooldown: 20,
            animation: "alphaCharacter-Attack1",
            slashAnim: {key: 'slash-SlashV5', width: 1, height: 1},
            hitbox: 'BasicArcSlash',
            se: {key: 'swing'},
            hitboxParam: {
                anchorX : 0.5,
                anchorY : 0.5,
                width : 64,
                height : 80,
                user: player,
                startAngle: -3.14,
                endAngle: 0,
                distance: 80,
                attack:{
                    power: 30,
                    knockback: 10,
                    particle: "slashHit",
                    penetration: 20
                }

            }
        }

        this.groundDownStats = {
            startup: 5,
            duration: 15,
            cooldown: 20,
            animation: "alphaCharacter-Attack2",
            slashAnim: {key: 'slash-SlashV5', width: 0.25, height: 2},
            se: {key: 'swing'},
            hitbox: 'BasicLongSlash',
            hitboxParam: {
                user: player,
                flipSensitive:true,
                attack:{
                    power: 30,
                    knockback: 10,
                    particle: "slashHit",
                    penetration: 20
                }
                
            }
        }

        this.airSideStats = {
            startup: 2,
            duration: 15,
            cooldown: 20,
            animation: "alphaCharacter-Attack1",
            slashAnim: {key: 'slash-SlashV5', width: 1, height: 1},
            se: {key: 'swing'},
            hitbox: 'BasicArcSlash',
            hitboxParam: {
                flipSensitive: true,
                user : player,
                attack:{
                    power: 30,
                    knockback: 10,
                    particle: "slashHit",
                    penetration: 20
                }
                
            }
        }

        this.airUpStats = {
            startup: 2,
            duration: 15,
            cooldown: 20,
            animation: "alphaCharacter-Attack1",
            slashAnim: {key: 'slash-SlashV5', width: 1, height: 1},
            se: {key: 'swing'},
            hitbox: 'BasicArcSlash',
            hitboxParam: {
                anchorX : 0.5,
                anchorY : 0.5,
                height : 80,
                user: player,
                startAngle: -3.14,
                endAngle: 0,
                distance: 80,
                attack:{
                    power: 30,
                    knockback: 10,
                    particle: "slashHit",
                    penetration: 20
                }
                
            }
        }

        this.airDownStats = {
            startup: 2,
            duration: 15,
            cooldown: 20,
            animation: "alphaCharacter-Attack1",
            slashAnim: {key: 'slash-SlashV5', width: 1, height: 1},
            se: {key: 'swing'},
            hitbox: 'BasicArcSlash',
            hitboxParam: {
                anchorX : 0.5,
                anchorY : 0.5,
                height : 80,
                user: player,
                startAngle: -6.28,
                endAngle: -3.14,
                distance: 80,
                attack:{
                    power: 30,
                    knockback: 10,
                    particle: "slashHit",
                    penetration: 20
                }
                
            }
        }
        
    }
}