import * as Globals from "./Globals.js";
import { GameScene } from "./scenes/GameScene.js";
import { Player } from "./gameObjects/Player.js";
import { BlockMap } from "./gameObjects/BlockMap.js";
import { Deferred } from "./Deferred.js";

class _GameInstance {
    constructor () {
        const config = {
            type: globalThis.Phaser.AUTO,
            width: Globals.BLOCKS_X * Globals.BLOCK_SIZE,
            height: Globals.BLOCKS_Y * Globals.BLOCK_SIZE,
            parent: document.querySelector("#game"),
            physics: {
                default: "arcade",
                arcade: {
                    debug: false,
                    gravity: { y: 600 },
                },
            },
            scene: null,
        };

        this.game = new globalThis.Phaser.Game(config);
        this.scenes = {};

        this.sceneDeferred = new Deferred();
    }

    createScene () {
        this.scenes.GameScene = new GameScene(this.sceneDeferred);
        this.game.scene.add("GameScene", this.scenes.GameScene, true);

        return this.sceneDeferred.promise;
    }

    resetPlayer () {
        this.scenes.GameScene.resetPlayer();
    }

    destroyScenes () {
        this.scenes.GameScene.scene.remove("");
        this.scenes = {};
    }

    createPlayer (id, x, y) {
        this.scenes.GameScene.createPlayer(id, x, y);
    }

    updatePlayer (id, x, y, animation, flipX) {
        this.scenes.GameScene.updatePlayer(id, x, y, animation, flipX);
    }

    setBlock (x, y, blockType, flipX) {
        this.scenes.GameScene.setBlock(x, y, blockType, flipX);
    }

    removeInventoryBlock (block) {
        this.scenes.GameScene.removeInventoryBlock(block);
    }

    fillInv (blockTypes) {
        this.scenes.GameScene.fillInv(blockTypes);
    }

    generateInventory (count) {
        this.scenes.GameScene.generateInventory(count);
    }
}

export const GameInstance = new _GameInstance();
globalThis.GameInstance = GameInstance;
