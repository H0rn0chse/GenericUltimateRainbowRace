const { Physics } = globalThis.Phaser;
const { Image } = Physics.Arcade;

export class Platform extends Image {
    constructor (world, scene) {
        super(scene, 400, 568, "ground");

        this.name = "Platform";

        world.enable([this], 1);

        this.setImmovable(true);
        this.body.allowGravity = false;
    }

    registerPreloads () {
        this.load.image("ground", "/assets/platform.png");
    }
}
