// eslint-disable-next-line import/no-cycle
import { Player } from "../gameObjects/Player.js";
// eslint-disable-next-line import/no-cycle
import { Platform } from "../gameObjects/Platform.js";
// eslint-disable-next-line import/no-cycle
import { Ground } from "../gameObjects/Ground.js";

// eslint-disable-next-line import/no-cycle
import { BlockMap } from "../gameObjects/BlockMap.js";

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

        this.load.image("sky", "/assets/sky.png");
        this.load.image("star", "/assets/star.png");
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
                this.physics.add.collider(object1, object2);
                map.delete(collisionConfig);
            }
        });
    }

    create () {
        this.add.image(400, 300, "sky");

        this.cursors = this.input.keyboard.createCursorKeys();
        this.player = this.addGameObject(new Player(this.physics.world, this));
        this.addGameObject(new Platform(this.physics.world, this));
        this.addGameObject(new Ground(this.physics.world, this));
        this.addGameObject(new BlockMap(this.physics.world, this));

        /* puppets = this.add.group({
            key: "star",
            frameQuantity: 12,
            maxSize: 12,
            active: false,
            visible: false,
        }); */
    }

    update () {
        this.updateCollider();
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-180);

            this.player.anims.play("left", true);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(180);

            this.player.anims.play("right", true);
        } else {
            this.player.body.setVelocityX(0);

            this.player.anims.play("turn");
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.body.setVelocityY(-500);
        }
        // that.updateServer(player.x, player.y);
    }
}
