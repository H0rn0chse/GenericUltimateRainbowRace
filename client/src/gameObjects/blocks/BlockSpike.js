import { Block } from "./Block.js";

export class BlockSpike extends Block {
    constructor (config) {
        super(config, "block_spike");

        this.body.setSize(26, 26);
    }

    onPlayerCollision (player) {
        player.die();
    }
}
