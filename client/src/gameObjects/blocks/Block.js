const { Physics } = globalThis.Phaser;

export class Block extends Physics.Arcade.Image {
  constructor(config, sprite) {
    super(config.scene, config.x, config.y, sprite);
  }
}
