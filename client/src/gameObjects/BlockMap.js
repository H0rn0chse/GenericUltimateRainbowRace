import * as Globals from "../Globals.js";
import { BlockBoring } from "./blocks/BlockBoring.js";
import { BlockBreakable } from "./blocks/BlockBreakable.js";

const { Physics } = globalThis.Phaser;

const BlockTypes = {
    Boring: BlockBoring,
    Breakable: BlockBreakable
};

var isDragging = false;
var draggedBlock;

export class BlockMap extends Physics.Arcade.StaticGroup {
    constructor (world, scene) {
        const config = {
            name: "map",
        };

        super(world, scene, [], config);
        this.name = "Map";

        for (let x = 0; x < Globals.BLOCKS_X; x++) {
            this.createBlock(x * Globals.BLOCK_SIZE, Globals.BLOCKS_Y * Globals.BLOCK_SIZE);
        }

        for (let i = 0; i < 20; i++) {
            this.createBlock(
                Phaser.Math.RND.between(0, Globals.BLOCKS_X) * Globals.BLOCK_SIZE,
                Phaser.Math.RND.between(0, Globals.BLOCKS_Y) * Globals.BLOCK_SIZE
            );
        }

        this.setDraggingBlock(0, 0, BlockTypes.Breakable);

        scene.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
        scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    }

    setDraggingBlock(x, y, BlockType) {
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
            } else {
                draggedBlock.destroy();
            }

            isDragging = false;
            draggedBlock = undefined;
        }

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

    canPlaceBlockAt(x, y) {
        var blocks = this.children.entries;

        var collision = false;
        blocks.forEach(block => {
            if (!block.isPreview() && Math.abs(block.x - x) <= Globals.BLOCK_SIZE && Math.abs(block.y - y) <= Globals.BLOCK_SIZE) {
                collision = true;
            }
        });

        return !collision;
    }

    createBlock (x, y, Block = BlockTypes.Boring) {
        var block = new Block({
            scene: this.scene,
            x: x,
            y: y
        });
        this.add(block);

        block.addToDisplayList(this.scene.sys.displayList);
        block.addToUpdateList();
        block.visible = true;
        block.setActive(true);

        return block;
    }

    registerPreloads () {
        this.load.spritesheet("block_stone", "/assets/1_stone.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("block_grass", "/assets/2_stone.png", { frameWidth: 42, frameHeight: 42 });
    }
}
