import { DYNAMIC, Phaser } from "../Globals.js";
import { PlayerBase } from "./PlayerBase.js";

export class Puppet extends PlayerBase {
    constructor (scene, name, playerId) {
        super(scene, 0, 0, "unicorn");
        this.playerId = playerId;

        const { world } = scene.physics;

        world.enable([this], DYNAMIC);
    }
}
