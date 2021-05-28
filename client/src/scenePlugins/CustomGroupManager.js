import { BlockGroup } from "../gameObjects/BlockGroup.js";
import { Inventory } from "../gameObjects/Inventory.js";
import { KittyGroup } from "../gameObjects/KittyGroup.js";
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

    kitty (...args) {
        const group = new KittyGroup(this.scene, ...args);
        return this.scene.add.existing(group);
    }

    inv (...args) {
        const group = new Inventory(this.scene, ...args);
        return this.scene.add.existing(group);
    }

    blocks (...args) {
        const group = new BlockGroup(this.scene, ...args);
        return this.scene.add.existing(group);
    }
}
