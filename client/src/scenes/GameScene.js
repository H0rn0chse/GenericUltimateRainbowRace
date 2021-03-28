import { Player } from "../gameObjects/Player.js";
import { BlockMap } from "../gameObjects/BlockMap.js";
import { Inventory } from "../gameObjects/Inventory.js";
import { Status, GameManager } from "../views/GameManager.js";
import { Rainbow } from "../gameObjects/Rainbow.js";
import { PhaseManager, Phases } from "../PhaseManager.js";

const { Scene } = globalThis.Phaser;

export class GameScene extends Scene {
    constructor (preloads, createDeferred) {
        super();
        this._preloads = preloads;
        this._gameObjects = new Map();
        this._collider = new Map();
        this._colliderWasUpdated = false;
        this.createDeferred = createDeferred;
        PhaseManager.listen(Phases.Build,this.generateInventory.bind(this, 4));
        globalThis.GameScene = this;
    }

    preload () {
        this._preloads.forEach((load) => {
            load.apply(this);
        });

        this.load.image("baqround1", "/assets/baqround1.png");
        this.load.image("baqround2", "/assets/baqround2.png");
        this.load.image("baqround3", "/assets/baqround3.png");
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
        this.cursor = this.input.keyboard.createCursorKeys();

        const baqround = this.add.image(1280, 578, "baqround3");
        baqround.x = 1280 / 2;
        baqround.y = 578 / 2;

        this.rainbow = this.addGameObject(new Rainbow(this.physics.world, this));
        this.map = this.addGameObject(new BlockMap(this.physics.world, this, 0));
        this.playerPuppets = this.add.group();

        this.player = this.addGameObject(new Player(this.physics.world, this, this.map.getSpawnPoint()));
        this.map.onPlayerCreated(this.player);

        this.createFlag();

        this.createDeferred.resolve();
    }

    createFlag () {
        const endPoint = this.map.getEndPoint();
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

    createPlayer (id, x, y) {
        const puppet = new Player(this.physics.world, this, { x, y }, true);
        puppet.id = id;

        this.add.existing(puppet);

        this.playerPuppets.children.set(puppet);

        // puppet.visible = true;
        // puppet.setPosition(x, y);
    }

    updatePlayer (id, x, y, animation, flipX = false) {
        const puppet = this.playerPuppets.children.get("id", id);
        puppet.setPosition(x, y);
        puppet.anims.play(animation, true);
        puppet.flipX = flipX;
    }

    resetPlayer () {
        const spawnPoint = this.map.getSpawnPoint()
        this.player.setPosition(spawnPoint.x, spawnPoint.y);
    }

    setBlock (x, y, blockType, flipX = false) {
        this.map.createBlock(x, y, blockType, flipX);
    }
    removeInventoryBlock(block) {
        this.map.removeInventoryBlock(block);
    }
    fillInv(blockTypes) {
        this.map.fillInv(blockTypes);
    }
    generateInventory(count) {
        if(PhaseManager.isHost) {
          this.map.generateInventory(count);  
        }
        
    }
    getCursor () {
        return this.cursor;
    }

    update (time, delta) {
        this.updateCollider();
        this._gameObjects.forEach((gameObject, name) => {
            gameObject.update?.(time, delta);
        });

        GameManager.updatePlayer(this.player.x, this.player.y, this.player.anims.currentAnim.key, this.player.flipX);
    }
}
