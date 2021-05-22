import { Block } from "./Block.js";
import { BLOCK_SIZE } from "../../Globals.js";

export class BlockPillar extends Block {
    constructor (config) {
        super(config, "block_pillar");
    }

    onPlayerCollision (player) {
        // If from above
        if (this.body.top >= player.body.bottom) {
            this.body.y += 1;
            this.y += 1;
        }
    }
}
