import { Block } from "./Block.js";

export class BlockGunSlow extends Block {
    constructor(config) {
        super(config, "gun_slow");
    }

    onPlayerCollision(player) {
        // If from below
        if (player.y - player.height / 2.0 >= this.y + this.height / 2.0) {
            this.destroy();
        }
    }
}
