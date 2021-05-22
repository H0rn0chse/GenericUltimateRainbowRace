import { Block } from "./Block.js";
import { BulletBig, BulletSmall } from "../Bullet.js";
import { Phases, PhaseManager } from "../../PhaseManager.js";

const State = {
    Idle: 1,
    Warmup: 2,
    Shooting: 4,
};

class BlockGun extends Block {
    constructor (config) {
        super(config, "");
        this.texture = this.getSpriteName();

        const { scene } = config;

        this.bullets = scene.add.group({
            classType: this.getBullet(),
            maxSize: 10,
        });

        this.bullets.createCallback = (bullet) => {
            scene.bulletGroup.add(bullet);
        };
        this.bullets.removeCallback = (bullet) => {
            scene.bulletGroup.remove(bullet);
        };

        this.createAnimations(scene);

        this.enterState(State.Idle);
    }

    getBullet () { return null; }

    getSpriteName () { return ""; }

    getIdleTime () { return 0; }

    createAnimations (scene) {}

    firesMultiple () { return false; }

    getFireTimeDelta () { return 1000; }

    update (time, delta) {
        if (this.isPreview() || !PhaseManager.isPhase(Phases.Run)) {
            return;
        }

        this.timer += delta;

        if (this.state === State.Idle && this.timer >= this.getIdleTime()) {
            this.enterState(State.Warmup);
        }
        if (this.state === State.Warmup && !this.anims.isPlaying) {
            this.enterState(State.Shooting);
        }
        if (this.state === State.Shooting && !this.anims.isPlaying) {
            this.enterState(State.Idle);
        }
        if (this.state === State.Shooting && this.anims.isPlaying) {
            if (this.firesMultiple() && this.timer >= this.getFireTimeDelta()) {
                this.timer = 0;
                this.fire();
            }
        }
    }

    enterState (state) {
        this.state = state;
        this.timer = 0;

        if (this.state === State.Idle) {
            this.anims.play(`${this.getSpriteName()}_idle`);
        } else if (this.state === State.Warmup) {
            this.anims.play(`${this.getSpriteName()}_warmup`);
        } else if (this.state === State.Shooting) {
            this.anims.play(`${this.getSpriteName()}_shooting`);
            this.fire();
        }
    }

    fire () {
        const bullet = this.bullets.get();
        if (bullet) {
            bullet.fire(this.x, this.y, this.isFlipped());
        }
    }
}

export class BlockGunSlow extends BlockGun {
    getBullet () { return BulletBig; }

    getSpriteName () { return "gun_slow"; }

    getIdleTime () { return 3000; }

    createAnimations (scene) {
        scene.anims.create({
            key: `${this.getSpriteName()}_idle`,
            frames: scene.anims.generateFrameNumbers(this.getSpriteName(), { frames: [0] }),
            frameRate: 1,
            repeat: -1,
        });

        scene.anims.create({
            key: `${this.getSpriteName()}_warmup`,
            frames: scene.anims.generateFrameNumbers(this.getSpriteName(), { frames: [0, 0, 2, 2, 0, 0, 2, 2, 0, 2, 0, 2, 0, 2, 0, 2] }),
            frameRate: 8,
        });

        scene.anims.create({
            key: `${this.getSpriteName()}_shooting`,
            frames: scene.anims.generateFrameNumbers(this.getSpriteName(), { frames: [0, 2, 1, 2, 1] }),
            frameRate: 4,
        });
    }
}
export class BlockGunFast extends BlockGun {
    getBullet () { return BulletSmall; }

    getSpriteName () { return "gun_fast"; }

    getIdleTime () { return 1000; }

    firesMultiple () { return true; }

    getFireTimeDelta () { return 200; }

    createAnimations (scene) {
        scene.anims.create({
            key: `${this.getSpriteName()}_idle`,
            frames: scene.anims.generateFrameNumbers(this.getSpriteName(), { frames: [0] }),
            frameRate: 1,
            repeat: -1,
        });

        scene.anims.create({
            key: `${this.getSpriteName()}_warmup`,
            frames: scene.anims.generateFrameNumbers(this.getSpriteName(), { frames: [0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1] }),
            frameRate: 4,
        });

        scene.anims.create({
            key: `${this.getSpriteName()}_shooting`,
            frames: scene.anims.generateFrameNumbers(this.getSpriteName(), { frames: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1] }),
            frameRate: 16,
        });
    }
}
