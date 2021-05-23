import { Block } from "./Block.js";
import { BLOCK_SIZE } from "../../Globals.js";

export class BlockPillar extends Block {
    constructor (config) {
        super(config, "block_pillar");
        this.fallSpeed = 1.5;
        this.initialY = this.y;
    }

    onPlayerCollision (player) {
        // If from above
        if (this.body.top >= player.body.bottom) {
            this.performAction(); // TODO tell server instead
        }
    }

    performAction () {
        this.y += this.fallSpeed;
        this.body.updateFromGameObject();
    }

    resetBlock () {
        this.y = this.initialY;
        this.body.updateFromGameObject();
    }
}
