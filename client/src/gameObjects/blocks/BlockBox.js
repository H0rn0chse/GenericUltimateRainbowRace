import { Block } from "./Block.js";

export class BlockBox extends Block {
    constructor (config) {
        super(config, "block_box");
    }

    onPlayerCollision (player) {
        // If from below
        if (player.body.top >= this.body.bottom) {
            this.performAction(); // TODO tell server instead
        }
    }

    performAction () {
        this.body.enable = false;
        this.setActive(false);
        this.setVisible(false);
    }

    resetBlock () {
        this.body.enable = true;
        this.setActive(true);
        this.setVisible(true);
    }
}
