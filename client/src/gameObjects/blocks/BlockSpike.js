import { Block } from "./Block.js";

export class BlockSpike extends Block {
    constructor (config) {
        super(config, "block_spike");

        this.body.setSize(26, 26);
    }

    onPlayerCollision (player) {
        // If from above
        if (this.body.top >= player.body.bottom) {
            player.die();
        }
    }
}
