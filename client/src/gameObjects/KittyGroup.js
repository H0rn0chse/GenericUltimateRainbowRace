import { GameBus } from "../EventBus.js";
import { Phaser } from "../Globals.js";
import { Kitty } from "./Kitty.js";
import { GameManager } from "../views/GameManager.js";

export class KittyGroup extends Phaser.Physics.Arcade.StaticGroup {
    constructor (scene, kitties = []) {
        const { world } = scene.physics;
        super(world, scene);

        this.runChildUpdate = true;

        kitties.forEach((kittyData) => {
            const kitty = new Kitty(scene, kittyData.x, kittyData.y, kittyData.id);
            this.add(kitty, true);
            kitty.setVisible(true);
        });

        GameBus.on("hideKitty", this.onHideKitty, this);
        GameBus.on("kittyCollected", this.onKittyCollected, this);
    }

    collectKitty (player, kitty) {
        if (!kitty.collected) {
            kitty.collected = true;
            GameManager.collectKitty(kitty.kittyId);
        }
    }

    onKittyCollected (kittyId) {
        const kitty = this.getMatching("kittyId", kittyId)[0];
        if (kitty) {
            kitty.collect();
        }
    }

    onHideKitty (kittyId) {
        const kitty = this.getMatching("kittyId", kittyId)[0];
        if (kitty) {
            kitty.hide();
        }
    }

    resetKitties () {
        const hiddenKittys = this.getMatching("visible", false);
        hiddenKittys.forEach((kitty) => {
            kitty.reset();
        });
    }

    destroy (...args) {
        GameBus.off("hideKitty", this.onHideKitty, this);
        GameBus.off("kittyCollected", this.onKittyCollected, this);
        super.destroy(...args);
    }
}
