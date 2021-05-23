import { PhaseBus } from "../EventBus.js";
import { PHASES } from "../Globals.js";
import { PhaseManager } from "../PhaseManager.js";

const blocks = [];
let that;

export class Inventory {
    constructor (scene) {
        that = this;
        this.generateBackground(scene);
        PhaseBus.on(PHASES.PreRun, this.onBuildPhaseOver, this);
    }

    onBuildPhaseOver (data) {
        this.disableInventory();
    }

    fillInventoryRandom (blockMap, blockTypes, count) {
        const blockIds = Object.keys(blockTypes);
        const blockCount = blockIds.length;
        const inputTypes = [];

        for (let i = 0; i < count; i++) {
            const randomBlockId = blockIds[this.getRandomInt(blockCount)];
            inputTypes.push(randomBlockId);
        }

        blockMap.sendInv(inputTypes);
        this.generateBlocks(blockMap, inputTypes);
    }

    generateBackground (scene) {
        this.graphics = scene.add.graphics();
        this.graphics.fillStyle(0xffff00, 1);
        this.graphics.fillRoundedRect(0, 50, 60, 420, { tl: 0, tr: 22, bl: 0, br: 22 });
    }

    generateBlocks (blockMap, blockTypes) {
        this.graphics.visible = true;
        let c = 0;
        blockTypes.forEach((type) => {
            const x = 30;
            const y = 100 + c * 60;
            const newBlock = blockMap.createBlock(x, y, type);
            newBlock.setIsPreview(true);
            newBlock.scaleToFitBlockSize();
            blocks.push(newBlock);
            c += 1;
            newBlock.setInteractive();
            newBlock.on("pointerdown", (pointer) => {
                if (PhaseManager.isPhase(PHASES.Build)) {
                    blockMap.setDraggingBlock(x, y, type);
                    that.selectOneBlock(newBlock, blockMap);
                }
            });
        });
    }

    disableInventory () {
        blocks.forEach((block) => {
            block.destroy();
        });
        this.graphics.visible = false;
    }

    selectOneBlock (blockChoice, blockMap) {
        let c = 0;
        blocks.forEach((block) => {
            if (blockChoice === block) {
                blockMap.sendBlockChoice(c);
            }
            c += 1;
        });
        this.disableInventory();
    }

    disableOneBlock (blockNr) {
        let c = 0;
        blocks.forEach((block) => {
            if (c === blockNr) {
                block.destroy();
            }
            c += 1;
        });
    }

    getRandomInt (max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    destroy () {
        super.destroy();
        PhaseBus.off(PHASES.PreRun, this.onBuildPhaseOver, this);
    }
}
