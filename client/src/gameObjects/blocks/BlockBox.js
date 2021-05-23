import { Block } from "./Block.js";

export class BlockBox extends Block {
    constructor (config) {
        super(config, "block_box");

        this.sound = this.scene.sound.add("block_break");
    }

    onPlayerCollision (player) {
        // If from below
        if (player.body.top >= this.body.bottom) {
            // update block on server and local block
            this.updateBlock({}, true);

            this.sound.play();
        }
    }

    onUpdateBlock () {
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
