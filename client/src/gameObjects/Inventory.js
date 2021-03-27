import { GameInstance } from "../GameInstance.js";
import * as Globals from "../Globals.js";
const { GameObjects } = globalThis.Phaser;
const { Group, Image } = GameObjects;
import { BlockBoring } from "./blocks/BlockBoring.js";

var blocks = [];
let that;
export class Inventory {
   
    constructor(scene){
        that = this;
        this.generateBackground(scene);
    }
    fillInventoryRandom(blockMap,blockTypes,count){
        var c = Object.keys(blockTypes).length;
        var inputTypes = [];

        for(var i=0;i<count;i++) {
            inputTypes.push(blockTypes[Object.keys(blockTypes)[this.getRandomInt(c)]]);
        }
        this.generateBlocks(blockMap,inputTypes);
    }
    generateBackground(scene)
    {
        let graphics = scene.add.graphics();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRoundedRect(0, 50, 60, 280, { tl: 0, tr: 22, bl: 0, br: 22 });
    }
    generateBlocks(blockMap,blockTypes)
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
                that.selectOneBlock(newBlock);
         });
        });
    }
    disableInventory(){
        blocks.forEach(function(block){
            block.destroy();
        });
    }
    selectOneBlock(blockChoice){   
        blocks.forEach(function(block){
            if(blockChoice != block){
            block.destroy();
            }
        });
    }
    disableOneBlock(block){
        block.destroy();
    }
    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }
};