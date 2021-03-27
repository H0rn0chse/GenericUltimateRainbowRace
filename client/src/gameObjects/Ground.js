const { Physics } = globalThis.Phaser;
const { Image } = Physics.Arcade;

export class Ground extends Image {
    constructor (world, scene) {
        super(scene, 400, 568, "ground");

        this.name = "Ground";

        world.enable([this], 1);

        this.setScale(2).refreshBody();
    }

    registerPreloads () {
        this.load.image("ground", "/assets/platform.png");
    }
}
