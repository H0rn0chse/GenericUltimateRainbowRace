const { Physics } = globalThis.Phaser;
const { Sprite } = Physics.Arcade;

export class Player extends Sprite {
    constructor (world, scene) {
        super(scene, 100, 450, "dude");

        this.name = "Player";
        this.collider = [{
            object1: this.name,
            object2: "Platform",
        }, {
            object1: this.name,
            object2: "Ground",
        }, {
            object1: this.name,
            object2: "Map",
        }];

        world.enable([this], 0);

        this.setBounce(0.2);
        this.setCollideWorldBounds(true);

        scene.anims.create({
            key: "left",
            frames: scene.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
        });

        scene.anims.create({
            key: "turn",
            frames: [{ key: "dude", frame: 4 }],
            frameRate: 20,
        });

        scene.anims.create({
            key: "right",
            frames: scene.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    registerPreloads () {
        this.load.spritesheet("dude", "/assets/dude.png", { frameWidth: 32, frameHeight: 48 });
    }
}
