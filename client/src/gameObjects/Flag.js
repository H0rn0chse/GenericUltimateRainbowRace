import { GameManager } from "../views/GameManager.js";
import { PhaseManager } from "../PhaseManager.js";
import { Phaser, PHASES, PLAYER_STATUS, STATIC } from "../Globals.js";

export class Flag extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y) {
        super(scene, x, y, "flag", 0);

        this.setOrigin(0, 1);

        const { world } = scene.physics;
        world.enable([this], STATIC);

        this.body.allowGravity = false;

        this.anims.create({
            key: "flag_wave",
            frames: this.anims.generateFrameNumbers("flag", { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.play("flag_wave", true);
    }

    onPlayerOverlap (player, flag) {
        if (!GameManager.runEnded) {
            player.onFlagTouched();
        }
        if (PhaseManager.isPhase(PHASES.Run)) {
            GameManager.endRun(PLAYER_STATUS.Alive);
        }
    }
}
