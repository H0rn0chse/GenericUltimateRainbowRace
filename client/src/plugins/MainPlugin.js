import { Player } from "../gameObjects/Player.js";
import { Phaser } from "../Globals.js";
import { CustomGroupManager } from "../scenePlugins/CustomGroupManager.js";
import { TileMaps } from "../scenePlugins/TileMaps.js";

export class MainPlugin extends Phaser.Plugins.BasePlugin {
    constructor (pluginManager) {
        super(pluginManager);

        pluginManager.registerGameObject("player", function (pos, skinId) {
            return this.displayList.add(new Player(this.scene, pos, skinId));
        });

        pluginManager.installScenePlugin("addGroup", CustomGroupManager, "addGroup");
        pluginManager.installScenePlugin("tileMaps", TileMaps, "tileMaps");
    }

    destroy () {
        this.pluginManager.removeScenePlugin("addGroup");
        this.pluginManager.removeScenePlugin("tileMaps");

        super.destroy();
    }
}
