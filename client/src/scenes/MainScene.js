import { Player } from "../gameObjects/Player.js";
import { BlockMap } from "../gameObjects/BlockMap.js";
import { Status, GameManager } from "../views/GameManager.js";
import { Rainbow } from "../gameObjects/Rainbow.js";
import { PhaseManager, Phases } from "../PhaseManager.js";
import { Phaser } from "../Globals.js";

export class MainScene extends Phaser.Scene {
    constructor (createDeferred) {
        super();
        this._gameObjects = new Map();
        this._collider = new Map();
        this._colliderWasUpdated = false;
        this.createDeferred = createDeferred;
        PhaseManager.listen(Phases.Build, this.generateInventory.bind(this, 4));
        globalThis.GameScene = this;
    }

    preload () {
        this.load.setPath("assets/baqrounds");
        this.load.image("baqround1", "baqround1.png");
        this.load.image("baqround2", "baqround2.png");
        this.load.image("baqround3", "baqround3.png");

        this.load.setPath("assets/blocks");
        this.load.spritesheet("flag", "flag.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("gun_slow", "gun_slow.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("gun_fast", "gun_fast.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("bullet_big", "bullet_big.png", { frameWidth: 10, frameHeight: 6 });
        this.load.spritesheet("bullet_small", "bullet_small.png", { frameWidth: 10, frameHeight: 6 });
        this.load.spritesheet("block_stone", "1_stone.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("block_grass", "2_stone.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("block_box", "block_box.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("block_speed", "block_speed.png", { frameWidth: 42, frameHeight: 42 });

        this.load.setPath("assets/tilemap");
        this.load.image("atlas", "atlas.png");
        this.load.tilemapTiledJSON("level_0", "level_0.json");

        this.load.setPath("assets/unicorn");
        this.load.spritesheet("unicorn", "unicorn.png", { frameWidth: 84, frameHeight: 84 });
        this.load.spritesheet("unicornDash", "dash.png", { frameWidth: 84, frameHeight: 84 });
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
        this.cursor = this.input.keyboard.createCursorKeys();

        const baqround = this.add.image(1280, 578, "baqround3");
        baqround.x = 1280 / 2;
        baqround.y = 578 / 2;

        this.rainbow = this.addGameObject(new Rainbow(this.physics.world, this));
        this.blockMap = this.addGameObject(new BlockMap(this.physics.world, this, 0));

        this.addGroup.puppet();

        this.player = this.addGameObject(new Player(this.physics.world, this, this.blockMap.getSpawnPoint()));
        this.blockMap.onPlayerCreated(this.player);

        this.createFlag();

        // ================== collision / overlap ==================
    }

    createFlag () {
        const endPoint = this.blockMap.getEndPoint();
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

    playerReachedFlag (player, flag) {
        if (PhaseManager.isPhase(Phases.Run)) {
            GameManager.endRun(Status.Alive);
        }
    }

    setBlock (x, y, blockType, flipX = false) {
        this.blockMap.createBlock(x, y, blockType, flipX);
    }

    removeInventoryBlock (block) {
        this.blockMap.removeInventoryBlock(block);
    }

    fillInv (blockTypes) {
        this.blockMap.fillInv(blockTypes);
    }

    generateInventory (count) {
        if (PhaseManager.isHost) {
            this.blockMap.generateInventory(count);
        }
    }

    getCursor () {
        return this.cursor;
    }

    resetScene () {
        const spawnPoint = this.blockMap.getSpawnPoint();
        this.player.reset(spawnPoint);
    }

    update (time, delta) {
        this.updateCollider();
        this._gameObjects.forEach((gameObject, name) => {
            gameObject.update?.(time, delta);
        });

        GameManager.updatePlayer(this.player.x, this.player.y, this.player.anims.currentAnim.key, this.player.flipX, this.player.body.velocity.x, this.player.body.velocity.y);
    }
}
