import * as Globals from "./Globals.js";

// eslint-disable-next-line import/no-cycle
import { GameScene } from "./scenes/GameScene.js";

import { Player } from "./gameObjects/Player.js";
import { Platform } from "./gameObjects/Platform.js";
import { Ground } from "./gameObjects/Ground.js";
import { BlockMap } from "./gameObjects/BlockMap.js";

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
                    gravity: { y: 600 },
                    debug: false,
                },
            },
            scene: null,
        };

        this.game = new globalThis.Phaser.Game(config);
        this.preloads = {
            GameScene: [],
        };
        this.scenes = {};
    }

    registerPreloads (sceneName, preloadHandler) {
        this.preloads[sceneName].push(preloadHandler);
    }

    createScene () {
        this.scenes.GameScene = new GameScene(this.preloads.GameScene);
        this.game.scene.add("GameScene", this.scenes.GameScene, true);
    }

    createPlayer (id, x, y) {
        /* const puppet = puppets.getChildren()[id];

        if (!puppet) return;

        puppet.visible = true;
        puppet.setPosition(x, y); */
    }

    movePlayer (id, x, y) {
        // puppets.getChildren()[id].setPosition(x, y);
    }
}

export const GameInstance = new _GameInstance();
globalThis.GameInstance = GameInstance;

GameInstance.registerPreloads("GameScene", Player.prototype.registerPreloads);
GameInstance.registerPreloads("GameScene", Platform.prototype.registerPreloads);
GameInstance.registerPreloads("GameScene", Ground.prototype.registerPreloads);
GameInstance.registerPreloads("GameScene", BlockMap.prototype.registerPreloads);
