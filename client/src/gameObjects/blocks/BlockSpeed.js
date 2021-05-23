import { Block } from "./Block.js";

export class BlockSpeed extends Block {
    constructor (config) {
        super(config, "block_speed");

        this.sound = this.scene.sound.add("block_bounce");
    }

    onPlayerCollision (player) {
        player.impulse.x = 400 * (this.isFlipped() ? -1 : 1);
        player.body.velocity.y = -500;

        this.sound.play();
    }
}
