import { Block } from "./Block.js";

export class BlockPillar extends Block {
    constructor (config) {
        super(config, "block_pillar");
        this.fallSpeed = 1.5;
        this.initialY = this.y;
    }

    onPlayerCollision (player) {
        // If from above
        if (this.body.top >= player.body.bottom) {
            // update block on server and local block
            this.updateBlock({}, true);
        }
    }

    onUpdateBlock () {
        this.y += this.fallSpeed;
        this.body.updateFromGameObject();
    }

    resetBlock () {
        this.y = this.initialY;
        this.body.updateFromGameObject();
    }
}
