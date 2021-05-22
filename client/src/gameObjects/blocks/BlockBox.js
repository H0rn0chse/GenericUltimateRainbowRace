import { Block } from "./Block.js";

export class BlockBox extends Block {
    constructor (config) {
        super(config, "block_box");
    }

    onPlayerCollision (player) {
        // If from below
        if (player.body.top >= this.body.bottom) {
            this.destroy();
        }
    }
}
