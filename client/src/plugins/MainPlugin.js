import { Player } from "../gameObjects/Player.js";
import { Phaser } from "../Globals.js";
import { CustomGroupManager } from "../scenePlugins/CustomGroupManager.js";
import { TileMaps } from "../scenePlugins/TileMaps.js";
import { DebugHelper } from "../scenePlugins/DebugHelper.js";
import { VolumeMixer } from "../scenePlugins/VolumeMixer.js";
import { TiledPlugin } from "../scenePlugins/TiledPlugin.js";
import { Flag } from "../gameObjects/Flag.js";

export class MainPlugin extends Phaser.Plugins.BasePlugin {
    constructor (pluginManager) {
        super(pluginManager);

        pluginManager.registerGameObject("player", function (pos, skinId) {
            return this.displayList.add(new Player(this.scene, pos, skinId));
        });

        pluginManager.registerGameObject("flag", function (pos) {
            return this.displayList.add(new Flag(this.scene, pos.x, pos.y));
        });

        pluginManager.installScenePlugin("addGroup", CustomGroupManager, "addGroup");
        pluginManager.installScenePlugin("tileMaps", TileMaps, "tileMaps");
        pluginManager.installScenePlugin("debug", DebugHelper, "debug");
        pluginManager.installScenePlugin("volume", VolumeMixer, "volume");
        pluginManager.installScenePlugin("tiled", TiledPlugin, "tiled");
    }

    destroy () {
        this.pluginManager.removeScenePlugin("addGroup");
        this.pluginManager.removeScenePlugin("tileMaps");
        this.pluginManager.removeScenePlugin("debug");
        this.pluginManager.removeScenePlugin("volume");
        this.pluginManager.removeScenePlugin("tiled");

        super.destroy();
    }
}
