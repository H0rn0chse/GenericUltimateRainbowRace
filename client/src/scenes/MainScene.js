import { BlockMap } from "../gameObjects/BlockMap.js";
import { GameManager } from "../views/GameManager.js";
import { PhaseManager } from "../PhaseManager.js";
import { BLOCKS_X, BLOCKS_Y, PHASES, LEVELS } from "../Globals.js";
import { createPlayerAnims } from "../PlayerAnimations.js";
import { GameBus, PhaseBus } from "../EventBus.js";
import { BaseScene } from "./BaseScene.js";

export class MainScene extends BaseScene {
    constructor (createDeferred) {
        super();
        this.createDeferred = createDeferred;
        PhaseBus.on(PHASES.Build, this.onBuild, this);
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
        for (let i = 0; i <= 10; i++) {
            this.load.tilemapTiledJSON(`level_${i}`, `level_${i}.json`);
        }

        this.load.setPath("assets/unicorn");
        this.load.spritesheet("unicorn", "unicorn.png", { frameWidth: 84, frameHeight: 84 });
        this.load.spritesheet("unicornDash", "dash.png", { frameWidth: 84, frameHeight: 84 });

        this.load.setPath("assets/panda");
        for (let i = 0; i <= 3; i++) {
            this.load.image(`pandaWalk_0${i}`, `pandaWalk_000${i}.png`);
        }
        for (let i = 0; i <= 4; i++) {
            this.load.image(`pandaJump_0${i}`, `pandaJump_000${i}.png`);
        }
        for (let i = 0; i <= 2; i++) {
            this.load.image(`pandaDash_0${i}`, `pandaDash_000${i}.png`);
        }
        this.load.image("pandaDie_00", "pandaDie_0000.png");

        this.load.setPath("assets/coffee");
        for (let i = 0; i <= 1; i++) {
            this.load.image(`coffeeWalk_0${i}`, `coffeeWalk_000${i}.png`);
        }
        for (let i = 0; i <= 2; i++) {
            this.load.image(`coffeeJump_0${i}`, `coffeeJump_000${i}.png`);
        }
        for (let i = 0; i <= 3; i++) {
            this.load.image(`coffeeDash_0${i}`, `coffeeDash_000${i}.png`);
        }
        for (let i = 0; i <= 1; i++) {
            this.load.image(`coffeeDie_0${i}`, `coffeeDie_000${i}.png`);
        }
    }

    create () {
        super.create();
        const { instanceConfig } = this.game;
        const { levelId, skinId } = instanceConfig;

        this.physics.pause();
        this.scale.displaySize.setAspectRatio(BLOCKS_X / BLOCKS_Y);
        this.scale.refresh();

        this.cursor = this.input.keyboard.createCursorKeys();

        const baqround = this.add.image(1280, 578, LEVELS[levelId].baqround);
        baqround.x = 1280 / 2;
        baqround.y = 578 / 2;

        this.tileMaps.init(levelId);
        const terrain = this.tiled.layer(this.tileMaps.createLayer("Terrain"));
        // this.debug.addLayer("Terrain", terrain);
        this.bulletGroup = this.physics.add.group({
            allowGravity: false,
            runChildUpdate: true,
        });

        this.blockMap = this.add.existing(new BlockMap(this.physics.world, this, 0));

        createPlayerAnims(this.anims);
        const puppets = this.addGroup.puppet();
        this.player = this.add.player(this.blockMap.getSpawnPoint(), skinId);

        const flag = this.add.flag(this.blockMap.getEndPoint());

        // ================== collision / overlap ==================
        // player collision
        this.physics.add.collider(this.player, terrain);
        this.physics.add.collider(this.player, this.blockMap, (player, block) => {
            block.onPlayerCollision?.(player);
        });
        this.physics.add.overlap(this.player, this.bulletGroup, (player, bullet) => {
            bullet.onPlayerHit?.(player);
        });
        // puppet collision
        this.physics.add.collider(puppets, terrain);
        this.physics.add.collider(puppets, this.blockMap);
        this.physics.add.overlap(this.player, flag, flag.onPlayerOverlap, null, flag);

        GameBus.emit("sceneReady");
    }

    removeInventoryBlock (block) {
        this.blockMap.removeInventoryBlock(block);
    }

    fillInv (blockTypes) {
        this.blockMap.fillInv(blockTypes);
    }

    onBuild () {
        if (PhaseManager.isHost) {
            this.blockMap.generateInventory(4);
        }
    }

    resetScene () {
        const spawnPoint = this.blockMap.getSpawnPoint();
        this.player.reset(spawnPoint);
    }

    update (time, delta) {
        if (!PhaseManager.isPhase(PHASES.Initial)) {
            if (this.physics.world.isPaused) {
                this.physics.resume();
            }
            this.player.update(time, delta);

            GameManager.updatePlayer(this.player.getData());
        }
    }

    destroy () {
        PhaseBus.off(PHASES.Build, this.onBuild, this);
    }
}
