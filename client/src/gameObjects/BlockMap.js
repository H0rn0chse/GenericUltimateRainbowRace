import * as Globals from "../Globals.js";
import { GameManager } from "../views/GameManager.js";
import { BlockBoring } from "./blocks/BlockBoring.js";
import { BlockBox } from "./blocks/BlockBox.js";
import { BlockBreakable } from "./blocks/BlockBreakable.js";
import { BlockGunSlow, BlockGunFast } from "./blocks/BlockGun.js";
import { Inventory } from "./Inventory.js";

const { Physics, Input } = globalThis.Phaser;

const BlockTypes = {
    Boring: BlockBoring,
    Box: BlockBox,
    Breakable: BlockBreakable,
    GunSlow: BlockGunSlow,
    GunFast: BlockGunFast
};
let inv;
let isDragging = false;
let draggedBlock;

export class BlockMap extends Physics.Arcade.StaticGroup {
    constructor (world, scene, levelId) {
        super(world, scene, [], {});
        this.name = "Map";
        this.runChildUpdate = true;

        const map = scene.make.tilemap({ key: `level_${levelId}` });
        const tileset = map.addTilesetImage("atlas", "atlas");
        const layer = map.createLayer("Terrain", tileset, 0, 0);

        layer.name = "MapLevel";
        scene.addGameObject(layer);
        layer.setCollisionByExclusion(-1, true);

        const spawnPointRaw = map.getObjectLayer("Spawn").objects;
        if (spawnPointRaw.length >= 1) {
            this.spawnPoint = spawnPointRaw[0];
        }

        const endPointRaw = map.getObjectLayer("Goal").objects;
        if (endPointRaw.length >= 1) {
            this.endPoint = endPointRaw[0];
        }

        inv = new Inventory(scene);
        //

        scene.input.on(Input.Events.POINTER_UP, this.onPointerUp, this);
        scene.input.on(Input.Events.POINTER_MOVE, this.onPointerMove, this);
        scene.input.keyboard.on('keydown-R', this.onBlockFlip, this);
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
            if (!block.isPreview() && Math.abs(block.x - x) <= Globals.BLOCK_SIZE && Math.abs(block.y - y) <= Globals.BLOCK_SIZE) {
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
            flipped: flipX
        });
        block.type = blockType;
        this.add(block);

        block.addToDisplayList(this.scene.sys.displayList);
        block.addToUpdateList();
        block.visible = true;
        block.setActive(true);

        if (this.scene.player) {
            block.onPlayerCreated(this.scene.player);
        }

        return block;
    }

    onPlayerCreated (player) {
        this.children.entries.forEach((block) => {
            block.onPlayerCreated(player);
        });
    }

    registerPreloads () {
        this.load.spritesheet("block_stone", "/assets/1_stone.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("block_grass", "/assets/2_stone.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("block_box", "/assets/block_box.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("gun_slow", "/assets/gun_slow.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("gun_fast", "/assets/gun_fast.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("bullet_big", "/assets/bullet_big.png", { frameWidth: 10, frameHeight: 6 });
        this.load.spritesheet("bullet_small", "/assets/bullet_small.png", { frameWidth: 10, frameHeight: 6 });

        this.load.image("atlas", "/assets/tilemap/atlas.png");
        this.load.tilemapTiledJSON("level_0", "assets/tilemap/level_0.json");
    }
}
