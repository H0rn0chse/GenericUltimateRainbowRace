import { Block } from "./Block.js";

export class BlockPlatform extends Block {
    constructor (config) {
        super(config, "block_platform");
        this.body.checkCollision.down = false;
        this.body.checkCollision.left = false;
        this.body.checkCollision.right = false;
    }
}
