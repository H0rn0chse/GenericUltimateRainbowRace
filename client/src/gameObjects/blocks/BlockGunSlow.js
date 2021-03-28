import { Block } from "./Block.js";
import { Bullet } from "./../Bullet.js";

const State = {
    Idle: 1,
    Warmup: 2,
    Shooting: 4
}

const IDLE_TIME = 3000;

export class BlockGunSlow extends Block {
    constructor(config) {
        super(config, "gun_slow");

        this.bullets = config.scene.add.group({
            classType: Bullet,
            maxSize: 5,
            runChildUpdate: true
        });

        config.scene.anims.create({
            key: "gun_slow_idle",
            frames: config.scene.anims.generateFrameNumbers("gun_slow", { frames: [ 0 ] }),
            frameRate: 1,
            repeat: -1
        });

        config.scene.anims.create({
            key: "gun_slow_warmup",
            frames: config.scene.anims.generateFrameNumbers("gun_slow", { frames: [ 0,0, 2,2, 0,0, 2,2, 0,2,0,2,0,2,0,2,] }),
            frameRate: 8,
        });

        config.scene.anims.create({
            key: "gun_slow_shooting",
            frames: config.scene.anims.generateFrameNumbers("gun_slow", { frames: [ 0, 2, 1, 2, 1] }),
            frameRate: 4,
        });

        this.enterState(State.Idle);
    }

    update(time, delta) {
        this.timer += delta;

        if (this.state == State.Idle && this.timer >= IDLE_TIME) {
            this.enterState(State.Warmup);
        }
        if (this.state == State.Warmup && !this.anims.isPlaying) {
            this.enterState(State.Shooting);
        }
        if (this.state == State.Shooting && !this.anims.isPlaying) {
            this.enterState(State.Idle);
        }
    }

    enterState(state) {
        this.state = state;
        this.timer = 0;

        if (this.state == State.Idle) {
            this.anims.play("gun_slow_idle");
        } else if (this.state == State.Warmup) {
            this.anims.play("gun_slow_warmup");
        } else if (this.state == State.Shooting) {
            this.anims.play("gun_slow_shooting");
            this.fire()
        }

    }

    fire() {
        var bullet = this.bullets.get();
        if (bullet) {
            bullet.fire(this.x, this.y, this.isFlipped());
        }
    }

}
