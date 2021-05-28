import { GameManager } from "../views/GameManager.js";
import { PhaseManager } from "../PhaseManager.js";
import { BLOCKS_X, BLOCKS_Y, PHASES, LEVELS } from "../Globals.js";
import { createPlayerAnims } from "../PlayerAnimations.js";
import { GameBus } from "../EventBus.js";
import { BaseScene } from "./BaseScene.js";

export class MainScene extends BaseScene {
    constructor (createDeferred) {
        super();
        this.createDeferred = createDeferred;
        globalThis.GameScene = this;
    }

    preload () {
        this.load.setPath("assets/baqrounds");
        for (let i = 1; i <= 5; i++) {
            this.load.image(`baqround${i}`, `baqround${i}.png`);
        }

        this.load.setPath("assets/blocks");
        this.load.spritesheet("flag", "flag.png", { frameWidth: 42, frameHeight: 42 });
        this.load.image("kitty_00", "coin/coin_0000.png");
        this.load.image("kitty_01", "coin/coin_0001.png");
        this.load.image("kitty_02", "coin/coin_0002.png");
        this.load.spritesheet("gun_slow", "gun_slow.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("gun_fast", "gun_fast.png", { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet("bullet_big", "bullet_big.png", { frameWidth: 20, frameHeight: 10 });
        this.load.spritesheet("bullet_small", "bullet_small.png", { frameWidth: 10, frameHeight: 6 });
        this.load.image("block_stone", "1_stone.png");
        this.load.image("block_box", "block_box.png");
        this.load.image("block_speed", "block_speed.png");
        this.load.image("block_pillar", "pillar.png");
        this.load.image("block_spike", "stachel.png");
        this.load.image("block_banana", "Banana.png");
        this.load.image("block_palm_00", "palm/palm_0000.png");
        this.load.image("block_palm_01", "palm/palm_0001.png");
        this.load.image("block_platform", "platform.png");
        this.load.image("block_barrel", "Tonne.png");

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

        this.load.setPath("assets/dragon");
        for (let i = 0; i <= 2; i++) {
            this.load.image(`dragonWalk_0${i}`, `dragonWalk_000${i}.png`);
        }
        for (let i = 0; i <= 2; i++) {
            this.load.image(`dragonJump_0${i}`, `dragonJump_000${i}.png`);
        }
        for (let i = 0; i <= 3; i++) {
            this.load.image(`dragonDash_0${i}`, `dragonDash_000${i}.png`);
        }
        for (let i = 0; i <= 1; i++) {
            this.load.image(`dragonDie_0${i}`, `dragonDie_000${i}.png`);
        }

        this.load.setPath("assets/sound");
        this.load.audio("theme", "theme.ogg");
        this.load.audio("loose", "loose.ogg");
        this.load.audio("win", "win.ogg");
        this.load.audio("dash", "dash.ogg");
        this.load.audio("jump", "jump.ogg");

        this.load.audio("block_break", "block_break.ogg");
        this.load.audio("block_bounce", "block_bounce.ogg");
        this.load.audio("block_slip", "block_slip.ogg");

        this.load.setPath("assets/sound/walk");
        for (let i = 0; i <= 4; i++) {
            this.load.audio(`walk_${i}`, `footstep_grass_00${i}.ogg`);
        }

        // this.load.setPath("assets/sound/countdown");
        // for (let i = 1; i <= 10; i++) {
        //     this.load.audio(`count${i}`, `${i}.ogg`);
        // }

        this.load.setPath("assets/sound/kitty");
        for (let i = 1; i <= 12; i++) {
            this.load.audio(`kitty_collect_${i - 1}`, `powerUp${i}.ogg`);
        }
    }

    create () {
        super.create();
        const { instanceConfig } = this.game;
        const { levelId, skinId } = instanceConfig;

        const theme = this.sound.add("theme");
        this.volume.addMusic(theme);
        theme.play({ loop: true });

        this.physics.pause();
        this.scale.displaySize.setAspectRatio(BLOCKS_X / BLOCKS_Y);
        this.scale.refresh();

        this.cursor = this.input.keyboard.createCursorKeys();

        const baqround = this.add.image(1280, 578, LEVELS[levelId].baqround);
        baqround.x = 1280 / 2;
        baqround.y = 578 / 2;

        this.tileMaps.init(levelId);
        const terrain = this.tiled.layer(this.tileMaps.createLayer("Terrain"));

        this.bulletGroup = this.physics.add.group({
            allowGravity: false,
            runChildUpdate: true,
        });

        this.blocks = this.addGroup.blocks();
        const inventory = this.addGroup.inv();

        createPlayerAnims(this.anims);
        const puppets = this.addGroup.puppet();

        this.spawn = this.tileMaps.getObjects("Spawn")[0];
        this.spawn.y -= 30;

        this.player = this.add.player(this.spawn, skinId);
        this.player.setDepth(20);

        const flag = this.add.flag(this.tileMaps.getObjects("Goal")[0]);

        this.kittyGroup = this.addGroup.kitty(this.tileMaps.getObjects("Kitties"));

        // ================== collision / overlap ==================
        // placement collsion
        inventory.addDropOverlap(this.blocks);
        // player collision
        this.physics.add.collider(this.player, terrain);
        this.physics.add.collider(this.player, this.blocks, (player, block) => {
            block.onPlayerCollision?.(player);
        });
        this.physics.add.overlap(this.player, this.kittyGroup, (player, kitty) => {
            this.kittyGroup.collectKitty(player, kitty);
        });
        this.physics.add.overlap(this.player, flag, flag.onPlayerOverlap, null, flag);
        // bullet collision
        this.physics.add.overlap(this.player, this.bulletGroup, (player, bullet) => {
            bullet.onPlayerHit(player);
        });
        this.physics.add.overlap(this.bulletGroup, terrain, (bullet, obstacle) => {
            bullet.onObstacleHit(obstacle);
        });
        this.physics.add.overlap(this.bulletGroup, this.blocks, (bullet, obstacle) => {
            bullet.onObstacleHit(obstacle);
        });
        // puppet collision
        this.physics.add.collider(puppets, terrain);
        this.physics.add.collider(puppets, this.blocks);

        GameBus.emit("sceneReady");
    }

    resetScene () {
        this.player.reset(this.spawn);
        this.kittyGroup.resetKitties();
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
        // cleanup
    }
}
