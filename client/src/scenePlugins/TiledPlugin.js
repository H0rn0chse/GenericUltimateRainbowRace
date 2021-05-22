import { TiledLayer } from "../gameObjects/tiled/TiledLayer.js";
import { BaseScenePlugin } from "./BaseScenePlugin.js";

export class TiledPlugin extends BaseScenePlugin {
    constructor (scene) {
        super(scene);
    }

    layer (...args) {
        const group = new TiledLayer(this.scene, ...args);
        return this.scene.add.existing(group);
    }
}
