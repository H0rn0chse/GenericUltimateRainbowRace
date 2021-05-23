import { DYNAMIC, Phaser } from "../Globals.js";

export class PlayerBase extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y, name) {
        super(scene, x, y, name);

        const { world } = scene.physics;
        world.enable([this], DYNAMIC);

        this.setSize(45, 50);
        this.setOffset(15, 5);
    }

    getData () {
        return {
            pos: {
                x: this.x,
                y: this.y,
            },
            anim: this.anims.currentAnim.key,
            flipX: this.flipX,
            vel: this.body.velocity,
        };
    }

    setData (data) {
        const { x, y } = data.pos;
        this.setPosition(x, y);
        this.anims.play(data.anim, true);
        this.flipX = data.flipX;
        this.body.setVelocity(data.vel.x, data.vel.y);
    }

    update (time, delta) {
        if (this.anims.currentAnim && this.anims.currentAnim.key.includes("Died")) {
            const tintRed = 1 - 0.5 * (Math.sin(0.04 * time) + 1);
            const tintDark = 1 - 0.5 * (Math.sin(0.023 * time) + 1);
            const tint = (Math.round(255 * tintDark) << 16)
                | (Math.round(255 * tintDark * tintRed) << 8)
                | (Math.round(255 * tintDark * tintRed));
            this.setTint(tint);
        } else {
            this.clearTint();
        }
    }
}
