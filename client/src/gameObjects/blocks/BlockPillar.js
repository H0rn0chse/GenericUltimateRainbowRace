import { Block } from "./Block.js";
import { BLOCK_SIZE } from "../../Globals.js";

export class BlockPillar extends Block {
    constructor (config) {
        super(config, "block_pillar");
        this.fallSpeed = 1.5;
    }

    onPlayerCollision (player) {
        // If from above
        if (this.body.top >= player.body.bottom) {
            this.y += this.fallSpeed;
            this.body.updateFromGameObject();
        }
    }
}
