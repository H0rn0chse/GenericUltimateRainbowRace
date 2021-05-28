import { BlockStone } from "../gameObjects/blocks/BlockStone.js";
import { BlockBox } from "../gameObjects/blocks/BlockBox.js";
import { BlockPillar } from "../gameObjects/blocks/BlockPillar.js";
import { BlockSpeed } from "../gameObjects/blocks/BlockSpeed.js";
import { BlockGunSlow, BlockGunFast } from "../gameObjects/blocks/BlockGun.js";
import { BlockSpike } from "../gameObjects/blocks/BlockSpike.js";
import { BlockBanana } from "../gameObjects/blocks/BlockBanana.js";
import { BlockPalm } from "../gameObjects/blocks/BlockPalm.js";
import { BlockPlatform } from "../gameObjects/blocks/BlockPlatform.js";
import { BlockBarrel } from "../gameObjects/blocks/BlockBarrel.js";
import { getRandomInt, guid } from "../utils.js";
import { BaseScenePlugin } from "./BaseScenePlugin.js";

export const BlockTypes = {
    Stone: BlockStone,
    Box: BlockBox,
    Pillar: BlockPillar,
    GunSlow: BlockGunSlow,
    GunFast: BlockGunFast,
    Speed: BlockSpeed,
    Spike: BlockSpike,
    Banana: BlockBanana,
    Palm: BlockPalm,
    Platform: BlockPlatform,
    Barrel: BlockBarrel,
};

export class BlockFactory extends BaseScenePlugin {
    constructor (scene) {
        super(scene);
    }

    getRandomBlockType () {
        const blockKeys = Object.keys(BlockTypes);
        const index = getRandomInt(blockKeys.length);
        return blockKeys[index];
    }

    createRandomBlock (blockId, pos) {
        const blockType = this.getRandomBlockType();
        return this.createBlock(blockType, blockId, pos);
    }

    createBlock (blockType = "Boring", blockId = guid(), pos, flipX = false) {
        const BlockConstructor = BlockTypes[blockType];

        const block = new BlockConstructor({
            scene: this.scene,
            x: pos.x,
            y: pos.y,
            flipped: flipX,
        });
        block.type = blockType;

        if (blockId) {
            block.blockId = blockId;
        }

        return block;
    }
}
