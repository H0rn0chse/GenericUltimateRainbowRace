import { GameInstance } from "./../GameInstance.js";
import * as Globals from "./../Globals.js";
const { GameObjects, Physics } = globalThis.Phaser;

import { BlockBoring } from "./blocks/BlockBoring.js";

const BlockTypes = {
  Default: BlockBoring
};

export class Map extends Physics.Arcade.StaticGroup {

  constructor (world, scene) {
    var config = {
      name: "map"
    };

    super(world, scene, [], config);

    for (var x = 0; x < Globals.BLOCKS_X; x++) {
      this.createBlock(x, Globals.BLOCKS_Y);
    }

    for (var i = 0; i < 20; i++) {
      this.createBlock(Phaser.Math.RND.between(0, Globals.BLOCKS_X), Phaser.Math.RND.between(0, Globals.BLOCKS_Y));
    }
  }
  createBlock(x, y, Block=BlockTypes.Default) {
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
}
