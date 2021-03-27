import { GameInstance } from "../GameInstance.js";
import * as Globals from "../Globals.js";
const { GameObjects } = globalThis.Phaser;
const { Group, Image } = GameObjects;
import { BlockBoring } from "./blocks/BlockBoring.js";

var blocks = [];
export class Inventory {
   
    constructor(){
        
    }
    generateUI(scene,blockMap,blockTypes)
    {
        this.generateBackground(scene);
        this.generateBlockPictures(blockMap,blockTypes);
    }
    generateBackground(scene)
    {
        let graphics = scene.add.graphics();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRoundedRect(0, 50, 60, 280, { tl: 0, tr: 22, bl: 0, br: 22 });
    }
    generateBlockPictures(blockMap,blockTypes)
    {
        let c = 0;
        blockTypes.forEach(function(type){      
            let x = 30;
            let y = 100 +c*60;
            var newBlock = blockMap.createBlock(x,y,type);
            blocks.push(newBlock)
            c = c+1;
            newBlock.setInteractive();
            newBlock.on('pointerdown', function (pointer) {
                blockMap.setDraggingBlock(x,y,type);
         });
        });
    }
    disableInventory(){
        blocks.forEach(function(block){
            block.setVisible(false);
        });
    }

};