import { BLOCKS_X, BLOCKS_Y, BLOCK_SIZE, Phaser } from "./Globals.js";
import { MainPlugin } from "./plugins/MainPlugin.js";
import { MainScene } from "./scenes/MainScene.js";
import { Deferred } from "./Deferred.js";
import { GameBus } from "./EventBus.js";

export class GameInstance {
    constructor (container, controller) {
        this.container = container;
        this.controller = controller;

        const phaserConfig = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: BLOCKS_X * BLOCK_SIZE,
                height: BLOCKS_Y * BLOCK_SIZE,
            },
            parent: container,
            physics: {
                default: "arcade",
                arcade: {
                    debug: false,
                    gravity: { y: 600 },
                },
            },
            scene: MainScene,
            plugins: {
                global: [
                    { key: "MainPlugin", plugin: MainPlugin, start: true },
                ],
            },
        };

        this.game = new Phaser.Game(phaserConfig);
        this.game.instanceConfig = controller.getGameInstanceConfig();

        this.game.events.once("postrender", () => {
            GameBus.emit("phaserReady");
        });
    }

    _getMainScene () {
        return this.game.scene.getScenes()[0];
    }

    setBlock (x, y, blockType, flipX) {
        this._getMainScene()?.setBlock(x, y, blockType, flipX);
    }

    removeInventoryBlock (block) {
        this._getMainScene()?.removeInventoryBlock(block);
    }

    fillInv (blockTypes) {
        this._getMainScene()?.fillInv(blockTypes);
    }

    generateInventory (count) {
        this._getMainScene()?.generateInventory(count);
    }

    resetMainScene () {
        this._getMainScene()?.resetScene();
    }

    destroy () {
        this.game.destroy(true);
    }
}
