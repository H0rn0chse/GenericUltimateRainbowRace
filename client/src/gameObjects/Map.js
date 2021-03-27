import { GameInstance } from "./../GameInstance.js";
import * as Globals from "./../Globals.js";
const { GameObjects } = globalThis.Phaser;
const { Group, Image } = GameObjects;

export class Map extends Group {
  constructor (scene) {
      var config = {
        name: "map",
      };

      super(scene, [], config);

      for (var i = 0; i < Globals.BLOCKS_X; i++) {
        console.log(i);
        var b = this.create(
          i * Globals.BLOCK_SIZE,
          Globals.BLOCKS_Y * Globals.BLOCK_SIZE,
          "block_stone"
        );
        this.add(b);
      }
      for (var i = 0; i < 20; i++) {
        console.log(i);
        var b = this.create(
          Phaser.Math.RND.between(0, Globals.BLOCKS_X) * Globals.BLOCK_SIZE,
          Phaser.Math.RND.between(0, Globals.BLOCKS_Y) * Globals.BLOCK_SIZE,
          "block_stone"
        );
        this.add(b);
      }
    }

  // registerPreloads () {
  //       this.load.spritesheet("block_stone", "/assets/1_stone.png", { frameWidth: 42, frameHeight: 42 });
  // }
}

// GameInstance.registerPreloads("GameScene", Map.prototype.registerPreloads);
