import { BaseScenePlugin } from "./BaseScenePlugin.js";

export class TileMaps extends BaseScenePlugin {
    constructor (scene) {
        super(scene);
    }

    init (levelId) {
        this.debug = this.scene.add.graphics();
        this.debug.setDepth(10);

        this.map = this.scene.make.tilemap({ key: `level_${levelId}` });

        const atlasTileset = this.map.addTilesetImage("atlas", "atlas");
        this.layerTilesets = {
            Terrain: [atlasTileset],
        };
    }

    getObjects (layerId) {
        return this.map.getObjectLayer(layerId).objects;
    }

    createLayer (layerId) {
        const layer = this.map.createLayer(layerId, this.layerTilesets[layerId], 0, 0);

        switch (layerId) {
            case "TerrainNew":
                break;
            default:
                layer.setCollisionByExclusion([-1], true);
        }

        return layer;
    }
}
