import { Block } from "./Block.js";

export class BlockBarrel extends Block {
    constructor (config) {
        super(config, "block_barrel");
        this.rollSpeed = 1.5;
        this.initialX = this.x;
    }

    onPlayerCollision (player) {
        // If from left
        if (this.body.left >= player.body.right) {
            this.updateBlock({ dir: 1 }, true);
        }
        // If from left
        if (this.body.right <= player.body.left) {
            this.updateBlock({ dir: -1 }, true);
        }
    }

    onUpdateBlock (data) {
        this.x += data.dir * this.rollSpeed;
        this.body.updateFromGameObject();
    }

    resetBlock () {
        this.x = this.initialX;
        this.body.updateFromGameObject();
    }
}
