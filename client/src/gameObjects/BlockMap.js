import * as Globals from "../Globals.js";
import { BlockBoring } from "./blocks/BlockBoring.js";
import { BlockBreakable } from "./blocks/BlockBreakable.js";
import { Inventory } from "./Inventory.js";
const { Physics } = globalThis.Phaser;

const BlockTypes = {
    Boring: BlockBoring,
    Breakable: BlockBreakable
};
var inv;
var isDragging = false;
var draggedBlock;

export class BlockMap extends Physics.Arcade.StaticGroup {
    constructor (world, scene, level_id) {
        super(world, scene, [], {});
        this.name = "Map";

        const map = scene.make.tilemap({ key: "level_" + level_id });
        const tileset = map.addTilesetImage("atlas", "atlas");
        const layer = map.createLayer("Terrain", tileset, 0, 0);

        layer.name = "MapLevel";
        scene.addGameObject(layer);
        layer.setCollisionByExclusion(-1, true);

        var spawnPointRaw = map.getObjectLayer("Spawn")["objects"];
        if (spawnPointRaw.length >= 1) {
            this.spawnPoint = spawnPointRaw[0];
            console.log(this.spawnPoint);
        }

        inv = new Inventory();
        inv.generateUI(scene,this,[BlockTypes.Default,BlockTypes.Default]);

        scene.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
        scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    }

    getSpawnPoint() { return this.spawnPoint; }

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
                inv.disableInventory();
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

        this.load.image("atlas", "/assets/tilemap/atlas.png");
        this.load.tilemapTiledJSON("level_0", "assets/tilemap/level_0.json");
    }
}
