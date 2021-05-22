import { Phaser } from "../Globals.js";
import { Phases, PhaseManager } from "../PhaseManager.js";
import { Status, GameManager } from "../views/GameManager.js";
import { PlayerBase } from "./PlayerBase.js";

export class Player extends PlayerBase {
    constructor (world, scene, spawnPoint) {
        super(scene, spawnPoint.x, spawnPoint.y - 30, "unicorn");

        this.character = "Coffee";

        this.cursor = scene.getCursor();
        this.impulse = new Phaser.Math.Vector2(0, 0);

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

    die () {
        if (PhaseManager.isPhase(Phases.Run)) {
            console.log("Player died!");
            GameManager.endRun(Status.Dead);
            this.isDead = true;

            this.anims.play(`player${this.character}Died`, true);
        }
    }

    reset (position) {
        this.isDead = false;
        this.setPosition(position.x, position.y);
        this.body.setVelocityX(0);
        this.flipX = false;
        this.anims.play(`player${this.character}Idle`);
        this.impulse.x = 0;
        this.impulse.y = 0;
        this.curWalkSpeed = 0;
        this.isCurJumping = false;
        this.isCurDashing = false;
        this.hasDashed = false;
        this.wasDashKeyUp = true;
        this.clearTint();
    }

    update (time, delta) {
        super.update(time, delta);

        // only handle alive player
        if (this.isDead) {
            return;
        }

        // only allow user input during run phase
        if (!PhaseManager.isPhase(Phases.Run)) {
            this.anims.play(`player${this.character}Idle`);
            return;
        }

        // Jump
        this.curJumpTime += delta;
        if (this.animState === `player${this.character}JumpEnd` && this.body.onFloor()) {
            this.animState = false;
        }
        if (this.animState === `player${this.character}Jumping` && this.body.velocity.y > 0) {
            this.animState = `player${this.character}JumpEnd`;
        }
        if (this.animState === `player${this.character}JumpStart` && !this.anims.isPlaying) {
            this.animState = `player${this.character}Jumping`;
        }
        if (this.cursor.up.isDown || this.keys.W.isDown) {
            // Start jump
            if (this.body.onFloor()) {
                this.isCurJumping = true;
                this.curJumpTime = 0.0;
                this.animState = `player${this.character}JumpStart`;
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
            this.animState = `player${this.character}Dash`;
        }
        // End dash
        if (this.isCurDashing && this.curDashTime > this.dashTime) {
            this.isCurDashing = false;
            this.animState = this.body.onFloor() ? false : `player${this.character}Jumping`;
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
        if (this.animState !== `player${this.character}Dash` && ctrlDir !== 0) {
            this.flipX = ctrlDir < 0;
        }
        if (this.animState === false) {
            this.anims.play(ctrlDir === 0 ? `player${this.character}Idle` : `player${this.character}Walk`, true);
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
