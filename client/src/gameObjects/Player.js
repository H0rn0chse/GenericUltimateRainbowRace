import { Phaser } from "../Globals.js";
import { Phases, PhaseManager } from "../PhaseManager.js";
import { Status, GameManager } from "../views/GameManager.js";
import { PlayerBase } from "./PlayerBase.js";

export class Player extends PlayerBase {
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

            this.setBounce(0.0);
            this.setCollideWorldBounds(true);

            // keys
            this.keys = {};
            this.keys.W = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keys.A = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.keys.S = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.keys.D = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            this.keys.Space = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

            // constants
            this.eps = 10;

            // walking constants
            this.walkAccel = 1.8;
            this.walkSpeedMax = 180;
            this.stopAccel = 0.9;

            // jumping constants
            this.jumpTimeMax = 400.0;
            this.jumpTimeMin = 100.0;
            this.jumpSpeed = 250.0;

            // dashing constants
            this.dashTime = 500.0;
            this.dashSpeed = this.walkSpeedMax;
            this.wasDashKeyUp = true;

            // state
            this.isDead = false;
            this.animState = false;
            this.curWalkSpeed = 0;
            this.isCurJumping = false;
            this.curJumpTime = 0;
            this.isCurDashing = false;
            this.hasDashed = false;
            this.curDashTime = 0;
            this.curDeathTime = 0;
        }

        scene.anims.create({
            key: "playerIdle",
            frames: [{ key: "unicorn", frame: 0 }],
            frameRate: 20,
        });

        scene.anims.create({
            key: "playerWalk",
            frames: scene.anims.generateFrameNumbers("unicorn", { start: 0, end: 4 }), // 5 frames
            frameRate: 10,
            repeat: -1,
        });

        scene.anims.create({
            key: "playerJumpStart",
            frames: scene.anims.generateFrameNumbers("unicorn", { start: 9, end: 11 }),
            frameRate: 16,
            repeat: 0,
        });
        scene.anims.create({
            key: "playerJumping",
            frames: scene.anims.generateFrameNumbers("unicorn", { start: 12, end: 12 }),
            frameRate: 16,
            repeat: -1,
        });
        scene.anims.create({
            key: "playerJumpEnd",
            frames: scene.anims.generateFrameNumbers("unicorn", { start: 13, end: 15 }),
            frameRate: 20,
            repeat: 0,
        });
        scene.anims.create({
            key: "playerDash",
            frames: scene.anims.generateFrameNumbers("unicorn", { start: 12, end: 12 }),
            frameRate: 16,
            repeat: -1,
        });

        scene.anims.create({
            key: "playerDied",
            frames: scene.anims.generateFrameNumbers("unicorn", { start: 16, end: 16 }),
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
        this.isDead = false;
        this.setPosition(position.x, position.y);
        this.body.setVelocityX(0);
        this.flipX = false;
        this.anims.play("playerIdle");
        this.impulse.x = 0;
        this.impulse.y = 0;
        this.curWalkSpeed = 0;
        this.isCurJumping = false;
        this.isCurDashing = false;
        this.hasDashed = false;
        this.wasDashKeyUp = true;
    }

    update (time, delta) {
        super.update(time, delta);

        // only handle alive player
        if (this.isDead) {
            return;
        }

        // only allow user input during run phase
        if (!PhaseManager.isPhase(Phases.Run)) {
            this.anims.play("playerIdle");
            return;
        }

        // Jump
        this.curJumpTime += delta;
        if (this.animState === "playerJumpEnd" && !this.anims.isPlaying) {
            this.animState = false;
        }
        if (this.animState === "playerJumping" && this.body.onFloor()) {
            this.animState = "playerJumpEnd";
        }
        if (this.animState === "playerJumpStart" && !this.anims.isPlaying) {
            this.animState = "playerJumping";
        }
        if (this.cursor.up.isDown || this.keys.W.isDown) {
            // Start jump
            if (this.body.onFloor()) {
                this.isCurJumping = true;
                this.curJumpTime = 0.0;
                this.animState = "playerJumpStart";
            // Continue jump
            } else if (this.isCurJumping) {
                if (this.curJumpTime >= this.jumpTimeMax) {
                    this.isCurJumping = false;
                }
            }
        // End jump
        } else if (this.isCurJumping && this.curJumpTime >= this.jumpTimeMin) {
            this.isCurJumping = false;
        }

        // Dash
        this.curDashTime += delta;
        const isDashKeyDown = (this.cursor.down.isDown || this.keys.S.isDown || this.keys.Space.isDown);
        if (!this.wasDashKeyUp && !isDashKeyDown) {
            this.wasDashKeyUp = true;
        }
        // Start dash
        if (!this.isCurDashing && !this.hasDashed && isDashKeyDown && this.wasDashKeyUp) {
            this.curDashTime = 0;
            this.isCurDashing = true;
            this.isCurJumping = false;
            this.hasDashed = true;
            this.wasDashKeyUp = false;
            this.curWalkSpeed = (this.flipX ? -1 : 1) * (this.dashSpeed);
            this.animState = "playerDash";
        }
        // End dash
        if (this.isCurDashing && this.curDashTime > this.dashTime) {
            this.isCurDashing = false;
            this.animState = this.body.onFloor() ? false : "playerJumping";
        }
        // Recover dash
        if (this.body.onFloor()) {
            this.hasDashed = false;
        }

        // walking & stopping
        let ctrlDir = 0;
        if (!this.isCurDashing) {
            if (this.cursor.left.isDown || this.keys.A.isDown) { ctrlDir -= 1; }
            if (this.cursor.right.isDown || this.keys.D.isDown) { ctrlDir += 1; }

            if (ctrlDir !== 0) {
                this.curWalkSpeed += ctrlDir * (this.walkAccel * delta);
            } else {
                this.curWalkSpeed -= Math.sign(this.curWalkSpeed) * (this.stopAccel * delta);
                if (Math.abs(this.curWalkSpeed) < this.eps) {
                    this.curWalkSpeed = 0;
                }
            }
        }

        // cap walk speed
        this.curWalkSpeed = Math.sign(this.curWalkSpeed) * Math.min(Math.abs(this.curWalkSpeed), this.walkSpeedMax);

        // determine animation
        if (this.animState !== "playerDash" && ctrlDir !== 0) {
            this.flipX = ctrlDir < 0;
        }
        if (this.animState === false) {
            this.anims.play(ctrlDir === 0 ? "playerIdle" : "playerWalk", true);
        } else {
            this.anims.play(this.animState, true);
        }

        this.body.setVelocityX(this.curWalkSpeed + this.impulse.x);
        if (!this.isCurDashing) {
            if (this.isCurJumping) {
                this.body.setVelocityY(this.impulse.y - this.jumpSpeed);
            } else {
                this.body.setVelocityY(this.body.velocity.y + this.impulse.y);
            }
        } else {
            this.body.setVelocityY(0);
        }

        this.impulse.x *= 0.95;
        this.impulse.y *= 0.95;
    }
}
