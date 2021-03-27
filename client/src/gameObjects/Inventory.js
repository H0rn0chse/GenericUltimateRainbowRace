import { GameInstance } from "../GameInstance.js";
import * as Globals from "../Globals.js";
const { GameObjects } = globalThis.Phaser;
const { Group, Image } = GameObjects;

export class Inventory {
    
    constructor(){

    }
    generateUI(scene)
    {
        this.generateBackground(scene);
    }
    generateBackground(scene)
    {
        let graphics = scene.add.graphics();
        graphics.fillStyle(0xff00ff, 1);
        graphics.fillRoundedRect(0, 30, 70, 400, { tl: 0, tr: 22, bl: 0, br: 22 });
    }
    generateBlockPictures(scene,blocks)
    {
        blocks.foreach((function(block){

        }));
    }
    
};