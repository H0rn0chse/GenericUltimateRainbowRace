import { Phaser, PHASES, INVENTORY_SIZE } from "../Globals.js";
import { PhaseBus, GameBus } from "../EventBus.js";
import { GameManager } from "../views/GameManager.js";
import { PhaseManager } from "../PhaseManager.js";
import { guid } from "../utils.js";

export class Inventory extends Phaser.Physics.Arcade.StaticGroup {
    constructor (scene) {
        const { world } = scene.physics;
        super(world, scene);

        this.draggedBlock = null;
        this.graphics = this._generateBackground();

        scene.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
        scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
        scene.input.keyboard.on("keydown-R", this.onBlockFlip, this);

        GameBus.on("fillInventory", this.onFillInventory, this);
        GameBus.on("selectBlock", this.onSelectBlock, this);
        PhaseBus.on(PHASES.Colors, this.onColors, this);
        PhaseBus.on(PHASES.PreRun, this.onPreRun, this);

        this.overlapElements = new Map();
    }

    addDropOverlap (element) {
        this.overlapElements.set(element, element);
    }

    clearInventory () {
        this.children.each((block) => {
            this.remove(block, true, true);
        });
    }

    generateInventory () {
        const { factory } = this.scene;
        const data = [];

        for (let index = 0; index < INVENTORY_SIZE; index++) {
            const pos = {
                x: 30,
                y: 100 + index * 60,
            };

            const blockId = guid();
            const blockType = factory.getRandomBlockType();

            data.push({
                type: blockType,
                blockId,
                pos,
            });
        }
        return data;
    }

    onFillInventory (data) {
        this.reset();
        const { factory } = this.scene;

        data.forEach((blockData) => {
            const { type, blockId, pos } = blockData;
            const block = factory.createBlock(type, blockId, pos);

            block.setPreview(true);
            block.scaleToFitBlockSize();

            block.setInteractive();
            block.on("pointerdown", this.onPointerDown.bind(this, block));

            this.add(block, true);
        });
    }

    onSelectBlock (data) {
        const { blockId } = data;
        const block = this.getMatching("blockId", blockId)[0];
        if (block) {
            this.remove(block, true, true);
        }
    }

    onBlockFlip () {
        if (this.draggedBlock) {
            this.draggedBlock.flipBlock();
        }
    }

    onPointerDown (block, pointer) {
        block.resetScale();
        this.draggedBlock = block;
        this.remove(block);

        GameManager.selectBlock(block.blockId);
        this.clearInventory();
        this.hide();
    }

    onPointerMove (pointer) {
        if (this.draggedBlock) {
            this.draggedBlock.setPosition(pointer.worldX, pointer.worldY);
            this.draggedBlock.refreshBody();

            if (this._canPlaceBlockAt(this.draggedBlock)) {
                this.draggedBlock.setHighlightCanPlace();
            } else {
                this.draggedBlock.setHighlightCannotPlace();
            }
        }
    }

    onPointerUp (pointer) {
        if (this.draggedBlock) {
            this.draggedBlock.setPosition(pointer.worldX, pointer.worldY);
            this.draggedBlock.refreshBody();

            if (this._canPlaceBlockAt(this.draggedBlock)) {
                const blockData = this._getBlockData(this.draggedBlock);

                GameManager.placeBlock(blockData);
            }

            this.reset();
            this.hide();
        }
    }

    onColors () {
        if (PhaseManager.isHost) {
            const data = this.generateInventory();
            GameManager.fillInventory(data);
        }
    }

    onPreRun () {
        this.reset();
        this.hide();
    }

    _canPlaceBlockAt (block) {
        const { scene } = this;
        const { world } = scene.physics;

        const overlapList = Array.from(this.overlapElements.values());

        return !world.overlap(block, [this, ...overlapList]);
    }

    _getBlockData (block) {
        const pos = {
            x: Math.round(block.x, 0),
            y: Math.round(block.y, 0),
        };
        return {
            blockType: block.type,
            blockId: block.blockId,
            flipX: block.isFlipped(),
            pos,
        };
    }

    _generateBackground () {
        const { scene } = this;
        const graphics = scene.add.graphics();
        graphics.fillStyle(0xffd000, 1);
        graphics.setDepth(100);
        graphics.fillRoundedRect(0, 50, 60, 420, { tl: 0, tr: 22, bl: 0, br: 22 });
        graphics.alpha = 0.8;
        return graphics;
    }

    show () {
        this.graphics.visible = true;
    }

    hide () {
        this.graphics.visible = false;
    }

    reset () {
        this.clearInventory();
        if (this.draggedBlock) {
            this.draggedBlock.destroy();
            this.draggedBlock = null;
        }
        this.show();
    }

    destroy () {
        this.overlapElements.clear();
        this.reset();

        GameBus.off("fillInventory", this.onFillInventory, this);
        GameBus.off("selectBlock", this.onSelectBlock, this);
        PhaseBus.off(PHASES.Colors, this.onColors, this);
        PhaseBus.off(PHASES.PreRun, this.onPreRun, this);
    }
}
