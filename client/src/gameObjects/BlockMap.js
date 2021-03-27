import * as Globals from "../Globals.js";

const { Physics } = globalThis.Phaser;

import { BlockBoring } from "./blocks/BlockBoring.js";

const BlockTypes = {
  Default: BlockBoring
};

export class BlockMap extends Physics.Arcade.StaticGroup {
    constructor (world, scene) {
        const config = {
            name: "map",
            // classType: Phaser.GameObjects.Image
        };

        super(world, scene, [], config);
        this.name = "Map";

        for (let x = 0; x < Globals.BLOCKS_X; x++) {
            this.createBlock(x, Globals.BLOCKS_Y);
        }

        for (let i = 0; i < 20; i++) {
            this.createBlock(Phaser.Math.RND.between(0, Globals.BLOCKS_X), Phaser.Math.RND.between(0, Globals.BLOCKS_Y));
        }
    }

    createBlock (x, y, Block = BlockTypes.Default) {
          var block = new Block({
                scene: this.scene,
                x: x * Globals.BLOCK_SIZE,
                y: y * Globals.BLOCK_SIZE
          });
          this.add(block);

          block.addToDisplayList(this.scene.sys.displayList);
          block.addToUpdateList();
          block.visible = true;
          block.setActive(true);
    }

    registerPreloads () {
        this.load.spritesheet("block_stone", "/assets/1_stone.png", { frameWidth: 42, frameHeight: 42 });
    }
}
