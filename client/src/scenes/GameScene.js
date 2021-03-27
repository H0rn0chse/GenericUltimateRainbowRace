// eslint-disable-next-line import/no-cycle
import { Player } from "../gameObjects/Player.js";
// eslint-disable-next-line import/no-cycle
import { Platform } from "../gameObjects/Platform.js";
// eslint-disable-next-line import/no-cycle
import { Ground } from "../gameObjects/Ground.js";

// eslint-disable-next-line import/no-cycle
import { BlockMap } from "../gameObjects/BlockMap.js";
import { Inventory } from "../gameObjects/Inventory.js";

const { Scene } = globalThis.Phaser;

export class GameScene extends Scene {
    constructor (preloads) {
        super();
        this._preloads = preloads;
        this._gameObjects = new Map();
        this._collider = new Map();
        this._colliderWasUpdated = false;
    }

    preload () {
        this._preloads.forEach((load) => {
            load.apply(this);
        });

        this.load.image("baqround1", "/assets/baqround1.png");
        this.load.image("star", "/assets/star.png");
        this.load.spritesheet("flag", "/assets/flag.png", { frameWidth: 42, frameHeight: 42 });

    }

    addGameObject (gameObject) {
        this._gameObjects.set(gameObject.name, gameObject);
        this.add.existing(gameObject);

        if (Array.isArray(gameObject.collider)) {
            gameObject.collider.forEach((collider) => {
                this._collider.set(collider, true);
                this._colliderWasUpdated = true;
            });
        }
        this.updateCollider();
        return gameObject;
    }

    updateCollider () {
        if (!this._collider.size === 0) {
            return;
        }

        this._collider.forEach((value, collisionConfig, map) => {
            // collider was already added
            if (!value) {
                return;
            }

            const object1 = this._gameObjects.get(collisionConfig.object1);
            const object2 = this._gameObjects.get(collisionConfig.object2);

            if (object1 && object2) {
                this.physics.add.collider(object1, object2, collisionConfig.handler || (() => {}));
                map.delete(collisionConfig);
            }
        });
    }

    create () {
        var baqround = this.add.image(1280, 578, "baqround1");
        baqround.x = 1280/2;
        baqround.y = 578/2;

        this.cursor = this.input.keyboard.createCursorKeys();
        this.map = this.addGameObject(new BlockMap(this.physics.world, this, 0));
        this.player = this.addGameObject(new Player(this.physics.world, this, this.map.getSpawnPoint()));

        this.createFlag();

        /* puppets = this.add.group({
            key: "star",
            frameQuantity: 12,
            maxSize: 12,
            active: false,
            visible: false,
        }); */
    }

    createFlag() {
        var endPoint = this.map.getEndPoint();
        this.flag = this.physics.add.sprite(endPoint.x + 21, endPoint.y - 21, "flag", 0);
        this.anims.create({
            key: "flag_wave",
            frames: this.anims.generateFrameNumbers("flag", { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1,
        });
        this.flag.body.allowGravity = false;
        this.flag.anims.play("flag_wave", true);

        this.physics.add.overlap(this.player, this.flag, this.playerReachedFlag, null, this);
    }

    playerReachedFlag(player, flag) {
        console.log("Player Reached Flag");
    }

    getCursor () {
        return this.cursor;
    }

    update () {
        this.updateCollider();
        // that.updateServer(player.x, player.y);
    }
}
