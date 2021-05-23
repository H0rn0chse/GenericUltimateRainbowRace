import { Block } from "./Block.js";

export class BlockPalm extends Block {
    constructor (config) {
        super(config, "block_palm_00");

        this.anims.create({
            key: "palmNormal",
            frames: [{ key: "block_palm_00" }],
            frameRate: 1,
            repeat: -1,
        });
        this.anims.create({
            key: "palmJump",
            frames: [{ key: "block_palm_01" }],
            frameRate: 2.0,
            repeat: 0,
        });

        this.anims.play("palmNormal");

        this.body.checkCollision.down = false;
        this.body.checkCollision.left = false;
        this.body.checkCollision.right = false;

        this.body.setSize(60, 99);
        this.body.setOffset(21, 0);

        this.sound = this.scene.sound.add("block_bounce");
    }

    onPlayerCollision (player) {
        // If from above
        if (this.body.top >= player.body.bottom) {
            player.body.velocity.y = -500;
            // update block on server and local block
            this.updateBlock({}, true);

            this.sound.play();
        }
    }

    resetBlock () {
        this.anims.play("palmNormal");
    }

    onUpdateBlock () {
        this.anims.play("palmJump");
    }

    update () {
        if (!this.anims.isPlaying) {
            this.anims.play("palmNormal");
        }
    }
}
