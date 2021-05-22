import { Phaser } from "../Globals.js";

export class BaseScene extends Phaser.Scene {
    create () {
        this.events.on("destroy", this.destroy, this);
    }

    destroy () {
        // might be implemented by the scene
    }
}
