import { GameBus } from "../EventBus.js";
import { Phaser } from "../Globals.js";
import { Puppet } from "./Puppet.js";

export class PuppetGroup extends Phaser.Physics.Arcade.Group {
    constructor (scene) {
        const { world } = scene.physics;
        super(world, scene);

        this.runChildUpdate = true;

        GameBus.on("playerUpdated", this.onPlayerUpdated, this);
        GameBus.on("playerRemoved", this.onPlayerRemoved, this);
    }

    onPlayerUpdated (playerId, data) {
        let puppet = this.getMatching("playerId", playerId)[0];

        if (!puppet) {
            puppet = new Puppet(this.scene, data.avatarId, playerId);
            this.add(puppet, true);
            puppet.setCollideWorldBounds(true);
            puppet.body.setAllowGravity(false);
        }

        const { x, y } = data.pos;
        puppet.setPosition(x, y);
        puppet.anims.play(data.anim, true);
        puppet.flipX = data.flipX;
        // puppet.body.setVelocity(data.vel.x, data.vel.y);
    }

    onPlayerRemoved (playerId) {
        const puppet = this.getMatching("playerId", playerId)[0];
        if (puppet) {
            this.remove(puppet, true, true);
        }
    }

    destroy (...args) {
        GameBus.off("playerUpdated", this.onPlayerUpdated, this);
        GameBus.off("playerRemoved", this.onPlayerRemoved, this);
        super.destroy(...args);
    }
}
