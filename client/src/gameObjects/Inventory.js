import { GameInstance } from "../GameInstance.js";
import * as Globals from "../Globals.js";
const { GameObjects } = globalThis.Phaser;
const { Group, Image } = GameObjects;

export class Inventory {
    
    constructor(){

      
    }
    generateUI(scene,blockMap)
    {
        this.generateBackground(scene);
        this.generateBlockPictures(blockMap);
    }
    generateBackground(scene)
    {
        let graphics = scene.add.graphics();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRoundedRect(0, 50, 60, 280, { tl: 0, tr: 22, bl: 0, br: 22 });
    }
    generateBlockPictures(blockMap)
    {
       blockMap.createBlock(30,100);
       blockMap.createBlock(30,160);
       blockMap.createBlock(30,220);
       blockMap.createBlock(30,280);
    }
    clickOnBlock(blockMap)
    {

    }
    
};
