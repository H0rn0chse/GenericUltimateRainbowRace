const { Physics } = globalThis.Phaser;

export class Block extends Physics.Arcade.Image {
    constructor (config, sprite) {
        super(config.scene, config.x, config.y, sprite);
        this._isPreview = false;
        this._isFlipped = false;
    }

    flipBlock() {
        this._isFlipped = !this._isFlipped;
        this.flipX = this._isFlipped;
    }

    onPlayerCollision (player) {

    }

    setIsPreview (isPreview) {
        this._isPreview = isPreview;
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
}
