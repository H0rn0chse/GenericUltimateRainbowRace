import { Phases, PhaseManager } from "../PhaseManager.js";
import { Status, GameManager } from "../views/GameManager.js";

const { Physics } = globalThis.Phaser;
const { Sprite } = Physics.Arcade;

export class Player extends Sprite {
    constructor (world, scene, spawnPoint, isPuppet = false) {
        super(scene, spawnPoint.x, spawnPoint.y - 30, "unicorn");

        this.cursor = scene.getCursor();
        this.isPuppet = isPuppet;
        this.impulse = new Phaser.Math.Vector2(0, 0);

        if (!isPuppet) {
            this.name = "Player";
            this.collider = [{
                object1: this.name,
                object2: "Map",
                handler: (a, b) => {
                    b.onPlayerCollision(a);
                },
            }, {
                object1: this.name,
                object2: "MapLevel",
            }];

            world.enable([this], 0);

            this.setSize(45, 50);
            this.setOffset(15, 5);

            this.setBounce(0.2);
            this.setCollideWorldBounds(true);
        }

        scene.anims.create({
            key: "playerIdle",
            frames: [{ key: "unicorn", frame: 0 }],
            frameRate: 20,
        });

        scene.anims.create({
            key: "playerWalkLeft",
            frames: scene.anims.generateFrameNumbers("unicorn", { start: 0, end: 4 }), // 5 frames
            frameRate: 10,
            repeat: -1,
        });

        scene.anims.create({
            key: "playerWalkRight",
            frames: scene.anims.generateFrameNumbers("unicorn", { start: 0, end: 4 }), // 5 frames
            frameRate: 10,
            repeat: -1,
        });

        scene.anims.create({
            key: "playerJumpLeft",
            frames: scene.anims.generateFrameNumbers("unicorn", { start: 9, end: 15 }), // 8 frames
            frameRate: 16,
            repeat: -1,
        });

        scene.anims.create({
            key: "playerJumpRight",
            frames: scene.anims.generateFrameNumbers("unicorn", { start: 9, end: 15 }), // 8 frames
            frameRate: 16,
            repeat: -1,
        });

        scene.anims.create({
            key: "playerDied",
            frames: scene.anims.generateFrameNumbers("unicorn", { start: 16, end: 19 }),
            frameRate: 16,
            repeat: -1,
        });
    }

    die() {
        if (PhaseManager.isPhase(Phases.Run)) {
            console.log("Player died!");
            GameManager.endRun(Status.Dead);
            this.isDead = true;
            this.anims.play("playerDied", true);
        }
    }

    update () {
        // only handle the real player
        if (this.isPuppet || this.isDead) {
            return;
        }

        // only allow user input during run phase
        if (!PhaseManager.isPhase(Phases.Run)) {
            this.anims.play("playerIdle");
            return;
        }

        if (this.cursor.left.isDown) {
            this.body.setVelocityX(-180);

            if (!this.body.onFloor()) {
                this.anims.play("playerJumpLeft", true);
            } else {
                this.anims.play("playerWalkLeft", true);
            }
        } else if (this.cursor.right.isDown) {
            this.body.setVelocityX(180);

            if (!this.body.onFloor()) {
                this.anims.play("playerJumpRight", true);
            } else {
                this.anims.play("playerWalkRight", true);
            }
        } else {
            this.body.setVelocityX(0);
            this.anims.play("playerIdle");
        }



        // should watch right
        if (this.body.velocity.x > 0) {
            this.flipX = false;
        } else if (this.body.velocity.x < 0) {
            this.flipX = true;
        }

        if (this.cursor.up.isDown && this.body.onFloor()) {
            this.body.setVelocityY(-500);
        }

        this.body.velocity.x += this.impulse.x;
        this.body.velocity.y += this.impulse.y;
        this.impulse.x *= 0.95;
        this.impulse.y *= 0.95;
    }

    registerPreloads () {
        this.load.spritesheet("dude", "/assets/dude.png", { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet("unicorn", "/assets/unicorn.png", { frameWidth: 84, frameHeight: 84 });
    }
}
