import { GameInstance } from "../GameInstance.js";
import * as Globals from "../Globals.js";
const { GameObjects } = globalThis.Phaser;
const { Group, Image } = GameObjects;

export class Inventory {
    
    constructor(){

        this.input.on('pointerdown', function (pointer) {

            if (pointer.leftButtonDown() && pointer.rightButtonDown())
            {
                this.add.image(pointer.x, pointer.y, 'balls', 0);
            }
            else if (pointer.leftButtonDown())
            {
                this.add.image(pointer.x, pointer.y, 'balls', 1);
            }
            else if (pointer.rightButtonDown())
            {
                this.add.image(pointer.x, pointer.y, 'balls', 2);
            }
    
        }, this);
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