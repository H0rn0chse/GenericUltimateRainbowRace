import { PHASES, STATIC, BLOCK_SIZE } from "../Globals.js";
import { PhaseBus } from "../EventBus.js";

const { Physics } = globalThis.Phaser;

export class Kitty extends Physics.Arcade.Sprite {
    constructor (config) {
        super(config.scene, config.x, config.y, "kitty_00");
        this.scene.physics.world.enable([this], STATIC);
        PhaseBus.on(PHASES.Build, this.resetKitty, this);

        this.anims.create({
            key: "kittyNormal",
            frames: [{ key: "kitty_00" }, { key: "kitty_01" }],
            frameRate: 0.7,
            repeat: -1,
        });
        this.anims.create({
            key: "kittyCollect",
            frames: [{ key: "kitty_02" }, { key: "kitty_01" }, { key: "kitty_01" }],
            frameRate: 4,
            repeat: 0,
        });

        this.resetKitty();
    }

    update (delta, time) {
        if (this.collected && !this.anims.isPlaying) {
            this.body.enable = false;
            this.setActive(false);
            this.setVisible(false);
        }
    }

    onCollect (player) {
        if (!this.collected) {
            this.collected = true;
            this.anims.play("kittyCollect");

            // TODO increase score
            // TODO tell server
        }
    }

    resetKitty () {
        this.collected = false;

        this.anims.play("kittyNormal");

        this.body.enable = true;
        this.setActive(true);
        this.setVisible(true);
    }

    destroy () {
        super.destroy();
        PhaseBus.off(PHASES.Build, this.resetKitty, this);
    }
}
