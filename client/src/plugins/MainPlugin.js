import { Phaser } from "../Globals.js";
import { CustomGroupManager } from "../scenePlugins/CustomGroupManager.js";

export class MainPlugin extends Phaser.Plugins.BasePlugin {
    constructor (pluginManager) {
        super(pluginManager);

        /* custom gameObject
        pluginManager.registerGameObject("player", function (skinId, x, y) {
            return this.displayList.add(new Player(this.scene, skinId, x, y));
        });
        */

        /* add scene plugins
        pluginManager.installScenePlugin("count", Countdown, "count");
        */
        pluginManager.installScenePlugin("addGroup", CustomGroupManager, "addGroup");
    }

    destroy () {
        this.pluginManager.removeScenePlugin("addGroup");
        /* scene plugin cleanup
        this.pluginManager.removeScenePlugin("count");
        */

        super.destroy();
    }
}
