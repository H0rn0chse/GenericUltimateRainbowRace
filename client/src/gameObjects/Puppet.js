import { DYNAMIC, Phaser } from "../Globals.js";

export class Puppet extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, name, playerId) {
        super(scene, 0, 0, "unicorn");
        this.playerId = playerId;

        const { world } = scene.physics;

        world.enable([this], DYNAMIC);
    }
}
