
export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor (scene) {
        super(scene, 0, 0, "bullet_big");

        scene.anims.create({
            key: "bullet_big_fly",
            frames: scene.anims.generateFrameNumbers("bullet_big", { frames: [ 0, 1 ] }),
            frameRate: 3,
            repeat: -1
        });

        this.anims.play("bullet_big_fly", true);
    }

    fire (x, y, flipped) {
        this.setPosition(x + (flipped ? -8 : 8), y - 2);

        this.speed = Phaser.Math.GetSpeed(370, 1);
        this.speed = flipped ? -this.speed : this.speed;

        this.flipX = flipped;
        this.setActive(true);
        this.setVisible(true);
    }

    deactivate () {
        this.setActive(false);
        this.setVisible(false);
    }

    update (time, delta) {
        this.x += this.speed * delta;

        if (this.x < -200 || this.x > 1400) {
            this.deactivate();
        }
    }
}
