import { Phaser } from "../Globals.js";
import { Phases, PhaseManager } from "../PhaseManager.js";
import { Status, GameManager } from "../views/GameManager.js";

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor (world, scene, spawnPoint, isPuppet = false) {
        super(scene, spawnPoint.x, spawnPoint.y - 30, "unicorn");

        this.cursor = scene.getCursor();
        this.isPuppet = isPuppet;
        this.impulse = new Phaser.Math.Vector2(0, 0);

        this.walkSpeed = 180;

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

            this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
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

    die () {
        if (PhaseManager.isPhase(Phases.Run)) {
            console.log("Player died!");
            GameManager.endRun(Status.Dead);
            this.isDead = true;
            this.anims.play("playerDied", true);
        }
    }

    reset (position) {
        this.setPosition(position.x, position.y);
        this.isDead = false;
        this.body.setVelocityX(0);
        this.anims.play("playerIdle");
        this.impulse.x = 0;
        this.impulse.y = 0;
    }

    update () {
        // only handle the real player
        if (this.isPuppet || this.isDead) {
            return;
        }

        // only allow user input during run phase
        if (!PhaseManager.isPhase(Phases.Run)) {
            this.anims.play("playerIdle");
            return;
        }

        // get user directional input
        let ctrlDir = 0;
        if (this.cursor.left.isDown || this.keyA.isDown) { ctrlDir -= 1; }
        if (this.cursor.right.isDown || this.keyD.isDown) { ctrlDir += 1; }

        this.body.setVelocityX(ctrlDir * this.walkSpeed);

        if (ctrlDir !== 0) {
            const strJump = (this.body.onFloor()) ? "Walk" : "Jump";
            const strWalk = (ctrlDir > 0) ? "Right" : "Left";

            this.anims.play(`player${strJump}${strWalk}`, true);
            this.flipX = ctrlDir < 0;
        } else {
            this.anims.play("playerIdle");
        }

        if (this.body.onFloor()) {
            if (this.cursor.up.isDown || this.keyW.isDown) {
                this.body.setVelocityY(-500);
            }
        }

        this.body.velocity.x += this.impulse.x;
        this.body.velocity.y += this.impulse.y;
        this.impulse.x *= 0.95;
        this.impulse.y *= 0.95;
    }
}
