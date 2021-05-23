import { Block } from "./Block.js";

export class BlockBanana extends Block {
    constructor (config) {
        super(config, "block_banana");
        this.disableTime = 1500;
    }

    onPlayerCollision (player) {
        player.disableControlsFor(this.disableTime);

        const sign = player.flipX ? -1 : 1;
        player.body.setVelocityX(400 * sign);

        // update block on server and local block
        this.updateBlock({}, true);
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
