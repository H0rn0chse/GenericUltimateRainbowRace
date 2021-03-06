import { GameManager } from "../views/GameManager.js";
import { PhaseManager } from "../PhaseManager.js";
import { BlockStone } from "./blocks/BlockStone.js";
import { BlockBox } from "./blocks/BlockBox.js";
import { BlockPillar } from "./blocks/BlockPillar.js";
import { BlockSpeed } from "./blocks/BlockSpeed.js";
import { BlockGunSlow, BlockGunFast } from "./blocks/BlockGun.js";
import { BlockSpike } from "./blocks/BlockSpike.js";
import { BlockBanana } from "./blocks/BlockBanana.js";
import { BlockPalm } from "./blocks/BlockPalm.js";
import { BlockPlatform } from "./blocks/BlockPlatform.js";
import { BlockBarrel } from "./blocks/BlockBarrel.js";
import { Inventory } from "./Inventory.js";
import { BLOCK_SIZE, PHASES, Phaser } from "../Globals.js";
import { PhaseBus, GameBus } from "../EventBus.js";
import { guid } from "../utils.js";

const BlockTypes = {
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
let inv;
let isDragging = false;
let draggedBlock;

export class BlockMap extends Phaser.Physics.Arcade.StaticGroup {
    constructor (world, scene, levelId) {
        super(world, scene, [], {});
        this.runChildUpdate = true;

        const { tileMaps } = scene;

        const spawnPointRaw = tileMaps.getObjects("Spawn");
        if (spawnPointRaw.length >= 1) {
            this.spawnPoint = spawnPointRaw[0];
        }

        const endPointRaw = tileMaps.getObjects("Goal");
        if (endPointRaw.length >= 1) {
            this.endPoint = endPointRaw[0];
        }

        inv = new Inventory(scene);

        scene.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
        scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
        scene.input.keyboard.on("keydown-R", this.onBlockFlip, this);

        PhaseBus.on(PHASES.PreRun, this.onBuildPhaseOver, this);
        GameBus.on("setBlock", this.onSetBlock, this);
        GameBus.on("updateBlockId", this.onUpdateBlockId, this);
        GameBus.on("updateBlock", this.onUpdateBlock, this);
    }

    onBuildPhaseOver () {
        if (isDragging) {
            isDragging = false;
            draggedBlock.destroy();
            draggedBlock = undefined;
        }
    }

    onSetBlock (data) {
        this.createBlock(data.pos.x, data.pos.y, data.blockType, data.flipX, data.blockId);
    }

    onUpdateBlockId (data) {
        const { clientBlockId, blockId } = data;
        const block = this.getMatching("blockId", clientBlockId)[0];
        if (block) {
            block.blockId = blockId;
        }
    }

    onUpdateBlock (data) {
        const { blockId } = data;
        const block = this.getMatching("blockId", blockId)[0];
        if (block && block.onUpdateBlock) {
            block.onUpdateBlock(data);
        }
    }

    getSpawnPoint () {
        this.spawnPoint.y -= 10;
        return this.spawnPoint;
    }

    fillInv (blockTypes) {
        inv.generateBlocks(this, blockTypes);
    }

    sendInv (types) {
        GameManager.sendInv(types);
    }

    generateInventory (count) {
        inv.fillInventoryRandom(this, BlockTypes, count);
    }

    getEndPoint () {
        return this.endPoint;
    }

    setDraggingBlock (x, y, BlockType) {
        isDragging = true;
        draggedBlock = this.createBlock(x, y, BlockType);
        draggedBlock.setIsPreview(true);
    }

    onPointerUp (pointer) {
        if (isDragging) {
            if (this.canPlaceBlockAt(pointer.worldX, pointer.worldY)) {
                draggedBlock.destroy();
                inv.disableInventory();
                GameManager.setBlock(Math.round(pointer.worldX, 0), Math.round(pointer.worldY, 0), draggedBlock.type, draggedBlock.isFlipped(), guid());
            } else {
                draggedBlock.destroy();
            }

            isDragging = false;
            draggedBlock = undefined;
        }
    }

    sendBlockChoice (block) {
        GameManager.sendBlockChoice(block);
    }

    removeInventoryBlock (block) {
        inv.disableOneBlock(block);
    }

    onPointerMove (pointer) {
        if (isDragging) {
            if (this.canPlaceBlockAt(pointer.worldX, pointer.worldY)) {
                draggedBlock.setHighlightCanPlace();
            } else {
                draggedBlock.setHighlightCannotPlace();
            }
            draggedBlock.x = pointer.worldX;
            draggedBlock.y = pointer.worldY;
        }
    }

    onBlockFlip () {
        if (isDragging) {
            draggedBlock.flipBlock();
        }
    }

    canPlaceBlockAt (x, y) {
        const blocks = this.children.entries;

        let collision = false;
        blocks.forEach((block) => {
            if (!block.isPreview() && Math.abs(block.x - x) <= BLOCK_SIZE && Math.abs(block.y - y) <= BLOCK_SIZE) {
                collision = true;
            }
        });

        return !collision;
    }

    createBlock (x, y, blockType = "Boring", flipX = false, blockId) {
        const BlockConstructor = BlockTypes[blockType];

        const block = new BlockConstructor({
            scene: this.scene,
            x,
            y,
            flipped: flipX,
        });
        block.type = blockType;
        this.add(block);

        block.addToDisplayList(this.scene.sys.displayList);
        block.addToUpdateList();
        block.visible = true;
        block.setActive(true);

        if (blockId) {
            block.blockId = blockId;
        }

        return block;
    }

    destroy () {
        PhaseBus.off(PHASES.PreRun, this.onBuildPhaseOver, this);
        GameBus.off("setBlock", this.onSetBlock, this);
        GameBus.off("updateBlockId", this.onUpdateBlockId, this);
        GameBus.off("updateBlock", this.onUpdateBlock, this);
    }
}
