import { GameManager } from "../views/GameManager.js";
import { PhaseManager } from "../PhaseManager.js";
import { BlockBoring } from "./blocks/BlockBoring.js";
import { BlockBox } from "./blocks/BlockBox.js";
import { BlockSpeed } from "./blocks/BlockSpeed.js";
import { BlockBreakable } from "./blocks/BlockBreakable.js";
import { BlockGunSlow, BlockGunFast } from "./blocks/BlockGun.js";
import { Inventory } from "./Inventory.js";
import { BLOCK_SIZE, PHASES, Phaser } from "../Globals.js";

const BlockTypes = {
    Boring: BlockBoring,
    Box: BlockBox,
    Breakable: BlockBreakable,
    GunSlow: BlockGunSlow,
    GunFast: BlockGunFast,
    Speed: BlockSpeed,
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

        PhaseManager.listen(PHASES.PreRun, this.onBuildPhaseOver.bind(this));
    }

    onBuildPhaseOver () {
        if (isDragging) {
            isDragging = false;
            draggedBlock.destroy();
            draggedBlock = undefined;
        }
    }

    getSpawnPoint () {
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
                draggedBlock.setIsPreview(false);
                draggedBlock.x = Math.round(pointer.worldX, 0);
                draggedBlock.y = Math.round(pointer.worldY, 0);
                draggedBlock.resetHighlight();
                draggedBlock.refreshBody();
                inv.disableInventory();
                GameManager.setBlock(draggedBlock.x, draggedBlock.y, draggedBlock.type, draggedBlock.isFlipped());
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

    createBlock (x, y, blockType = "Boring", flipX = false) {
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

        return block;
    }
}
