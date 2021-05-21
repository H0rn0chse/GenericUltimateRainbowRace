import { PuppetGroup } from "../gameObjects/PuppetGroup.js";
import { BaseScenePlugin } from "./BaseScenePlugin.js";

export class CustomGroupManager extends BaseScenePlugin {
    constructor (scene) {
        super(scene);
    }

    puppet (...args) {
        const group = new PuppetGroup(this.scene, ...args);
        return this.scene.add.existing(group);
    }
}
