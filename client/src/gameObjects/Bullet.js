import { Phaser } from "../Globals.js";

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor (scene) {
        super(scene, 0, 0, "");

        this.texture = this.getSpriteName();

        scene.anims.create({
            key: `${this.getSpriteName()}_fly`,
            frames: scene.anims.generateFrameNumbers(this.getSpriteName(), { frames: [0, 1] }),
            frameRate: 3,
            repeat: -1,
        });

        this.anims.play(`${this.getSpriteName()}_fly`, true);
    }

    onPlayerHit (player) {
        player.die();
    }

    onObstacleHit (obstacle) {
        if (!("blockId" in obstacle) || obstacle.blockId !== this.gun.blockId) {
            this.deactivate();
        }
    }

    getSpriteName () { return ""; }

    getSpeed () { return 0; }

    fire (gun, x, y, flipped) {
        this.gun = gun;

        this.setPosition(x + (flipped ? -8 : 8), y - 2);

        this.speed = Phaser.Math.GetSpeed(this.getSpeed(), 1);
        this.speed = flipped ? -this.speed : this.speed;

        this.flipX = flipped;
        this.body.enable = true;
        this.setActive(true);
        this.setVisible(true);
    }

    deactivate () {
        this.body.enable = false;
        this.setActive(false);
        this.setVisible(false);
    }

    update (time, delta) {
        this.x += this.speed * delta;

        if (this.x < -200 || this.x > 1400) {
            this.deactivate();
        }
    }
}

export class BulletSmall extends Bullet {
    getSpriteName () { return "bullet_small"; }

    getSpeed () { return 450; }
}
export class BulletBig extends Bullet {
    getSpriteName () { return "bullet_big"; }

    getSpeed () { return 370; }
}
