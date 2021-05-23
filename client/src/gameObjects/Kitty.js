import { STATIC, Phaser } from "../Globals.js";

export class Kitty extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y, kittyId) {
        super(scene, x, y, "kitty_00");

        this.kittyId = kittyId;

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

        this.anims.play("kittyNormal");

        this.setOrigin(0);

        this.scene.physics.world.enable([this], STATIC);
    }

    collect () {
        this.collected = true;
        this.anims.play("kittyCollect");
    }

    hide () {
        this.setVisible(false);
        this.body.enable = false;
    }

    show () {
        this.setVisible(true);
        this.body.enable = true;
    }

    reset () {
        this.anims.play("kittyNormal");
        this.collected = false;
        this.show();
    }

    update (delta, time) {
        if (this.collected && !this.anims.isPlaying) {
            this.hide();
        }
    }
}