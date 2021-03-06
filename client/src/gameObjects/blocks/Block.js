import { PHASES, STATIC, BLOCK_SIZE } from "../../Globals.js";
import { PhaseBus } from "../../EventBus.js";
import { GameManager } from "../../views/GameManager.js";

const { Physics } = globalThis.Phaser;

export class Block extends Physics.Arcade.Sprite {
    constructor (config, sprite) {
        super(config.scene, config.x, config.y, sprite);
        this._isPreview = false;
        this.scene.physics.world.enable([this], STATIC);
        if (config.flipped) {
            this.flipBlock();
        }
        PhaseBus.on(PHASES.Build, this.resetBlock, this);
    }

    flipBlock () {
        this._isFlipped = !this._isFlipped;
        this.flipX = this._isFlipped;
    }

    isFlipped () {
        return this._isFlipped;
    }

    onPlayerCollision (player) {
        // to be implemented by the specific block
    }

    updateBlock (data = {}, updateLocalBlock = false) {
        data.blockId = this.blockId;
        if (updateLocalBlock && this.onUpdateBlock) {
            this.onUpdateBlock(data);
        }
        GameManager.updateBlock(data);
    }

    onUpdateBlock (data) {
        // to be implemented by the specific block
    }

    resetBlock () {
        // to be implemented by the specific block
    }

    setIsPreview (isPreview) {
        this._isPreview = isPreview;
        this.setActive(!isPreview);
        this.body.enable = !isPreview;
        this.setDepth(isPreview ? 101 : 0);
    }

    scaleToFitBlockSize () {
        const maxSize = Math.max(this.width, this.height);
        this.setScale(BLOCK_SIZE / maxSize);
    }

    isPreview () {
        return this._isPreview;
    }

    resetHighlight () {
        this.setTint(0xffffff);
        this.setAlpha(1);
    }

    setHighlightCanPlace () {
        this.setTint(0xffffff);
        this.setAlpha(0.7);
    }

    setHighlightCannotPlace () {
        this.setTint(0xff0000);
        this.setAlpha(0.7);
    }

    destroy (...args) {
        PhaseBus.off(PHASES.Build, this.resetBlock, this);
        super.destroy(...args);
    }
}
