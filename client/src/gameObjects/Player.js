const { Physics } = globalThis.Phaser;
const { Sprite } = Physics.Arcade;

export class Player extends Sprite {
    constructor (world, scene) {
        super(scene, 100, 450, "dude");

        this.name = "Player";
        this.collider = [{
            object1: this.name,
            object2: "Map",
            handler: function(a, b) {
                b.onPlayerCollision(a);
            }
        }, {
            object1: this.name,
            object2: "MapLevel"
        }];

        this.cursor = scene.getCursor();

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

    preUpdate () {
        if (this.cursor.left.isDown) {
            this.body.setVelocityX(-180);

            this.anims.play("left", true);
        } else if (this.cursor.right.isDown) {
            this.body.setVelocityX(180);

            this.anims.play("right", true);
        } else {
            this.body.setVelocityX(0);

            this.anims.play("turn");
        }

        if (this.cursor.up.isDown && this.body.onFloor()) {
            this.body.setVelocityY(-500);
        }
    }

    registerPreloads () {
        this.load.spritesheet("dude", "/assets/dude.png", { frameWidth: 32, frameHeight: 48 });
    }
}
