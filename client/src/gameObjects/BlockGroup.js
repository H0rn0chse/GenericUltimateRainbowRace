import { Phaser } from "../Globals.js";
import { GameBus } from "../EventBus.js";

export class BlockGroup extends Phaser.Physics.Arcade.StaticGroup {
    constructor (scene) {
        const { world } = scene.physics;
        super(world, scene);

        this.runChildUpdate = true;

        GameBus.on("placeBlock", this.onPlaceBlock, this);
        GameBus.on("updateBlock", this.onUpdateBlock, this);
    }

    onPlaceBlock (data) {
        const { factory } = this.scene;

        const block = factory.createBlock(data.blockType, data.blockId, data.pos, data.flipX);
        this.add(block, true);
    }

    onUpdateBlock (data) {
        const { blockId } = data;
        const block = this.getMatching("blockId", blockId)[0];

        if (block && block.onUpdateBlock) {
            block.onUpdateBlock(data);
        }
    }

    destroy () {
        GameBus.off("placeBlock", this.onPlaceBlock, this);
        GameBus.off("updateBlock", this.onUpdateBlock, this);
    }
}
