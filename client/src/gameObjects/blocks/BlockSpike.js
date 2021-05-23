import { Block } from "./Block.js";

export class BlockSpike extends Block {
    constructor (config) {
        super(config, "block_spike");
    }

    onPlayerCollision (player) {
        player.die();
    }
}
