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
                    debug: true,
                    gravity: { y: 600 },
                },
            },
            scene: null,
        };

        this.game = new globalThis.Phaser.Game(config);
        this.preloads = {
            GameScene: [],
        };
        this.scenes = {};

        this.sceneDeferred = new Deferred();
    }

    registerPreloads (sceneName, preloadHandler) {
        this.preloads[sceneName].push(preloadHandler);
    }

    createScene () {
        this.scenes.GameScene = new GameScene(this.preloads.GameScene, this.sceneDeferred);
        this.game.scene.add("GameScene", this.scenes.GameScene, true);

        return this.sceneDeferred.promise;
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
}

export const GameInstance = new _GameInstance();
globalThis.GameInstance = GameInstance;

GameInstance.registerPreloads("GameScene", Player.prototype.registerPreloads);
GameInstance.registerPreloads("GameScene", BlockMap.prototype.registerPreloads);
