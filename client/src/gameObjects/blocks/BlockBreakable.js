import { Block } from "./Block.js";

export class BlockBreakable extends Block {
    constructor (config) {
        super(config, "block_stone");
    }

    onPlayerCollision (player) {
        // If from below
        if (player.y - player.height / 2.0 >= this.y + this.height / 2.0) {
            this.destroy();
        }
    }
}
