export function createPlayerAnims (anims) {
    anims.create({
        key: "playerUnicornIdle",
        frames: [{ key: "unicorn", frame: 0 }],
        frameRate: 20,
    });

    anims.create({
        key: "playerUnicornWalk",
        frames: anims.generateFrameNumbers("unicorn", { start: 0, end: 4 }),
        frameRate: 10,
        repeat: -1,
    });

    anims.create({
        key: "playerUnicornJumpStart",
        frames: anims.generateFrameNumbers("unicorn", { start: 9, end: 11 }),
        frameRate: 16,
        repeat: 0,
    });
    anims.create({
        key: "playerUnicornJumping",
        frames: anims.generateFrameNumbers("unicorn", { start: 12, end: 12 }),
        frameRate: 16,
        repeat: -1,
    });
    anims.create({
        key: "playerUnicornJumpEnd",
        frames: anims.generateFrameNumbers("unicorn", { start: 13, end: 15 }),
        frameRate: 20,
        repeat: 0,
    });
    anims.create({
        key: "playerUnicornDash",
        frames: anims.generateFrameNumbers("unicornDash", { start: 0, end: 0 }),
        frameRate: 16,
        repeat: -1,
    });

    anims.create({
        key: "playerUnicornDied",
        frames: anims.generateFrameNumbers("unicorn", { start: 16, end: 16 }),
        frameRate: 16,
        repeat: -1,
    });

    anims.create({
        key: "playerPandaIdle",
        frames: [{ key: "pandaWalk_00" }],
        frameRate: 20,
    });

    anims.create({
        key: "playerPandaWalk",
        frames: [{ key: "pandaWalk_00" }, { key: "pandaWalk_01" }, { key: "pandaWalk_02" }, { key: "pandaWalk_03" }],
        frameRate: 10,
        repeat: -1,
    });

    anims.create({
        key: "playerPandaJumpStart",
        frames: [{ key: "pandaJump_01" }],
        frameRate: 2.6,
        repeat: 0,
    });
    anims.create({
        key: "playerPandaJumping",
        frames: [{ key: "pandaJump_02" }],
        frameRate: 16,
        repeat: -1,
    });
    anims.create({
        key: "playerPandaJumpEnd",
        frames: [{ key: "pandaJump_03" }, { key: "pandaJump_04" }],
        frameRate: 2.6,
        repeat: 0,
    });
    anims.create({
        key: "playerPandaDash",
        frames: [{ key: "pandaDash_00" }, { key: "pandaDash_01" }, { key: "pandaDash_02" }],
        frameRate: 8,
        repeat: -1,
    });

    anims.create({
        key: "playerPandaDied",
        frames: [{ key: "pandaDie_00" }],
        frameRate: 16,
        repeat: -1,
    });

    anims.create({
        key: "playerCoffeeIdle",
        frames: [{ key: "coffeeWalk_00" }],
        frameRate: 20,
    });

    anims.create({
        key: "playerCoffeeWalk",
        frames: [{ key: "coffeeWalk_00" }, { key: "coffeeWalk_01" }],
        frameRate: 5,
        repeat: -1,
    });

    anims.create({
        key: "playerCoffeeJumpStart",
        frames: [{ key: "coffeeJump_00" }],
        frameRate: 2.6,
        repeat: 0,
    });
    anims.create({
        key: "playerCoffeeJumping",
        frames: [{ key: "coffeeJump_01" }],
        frameRate: 1,
        repeat: -1,
    });
    anims.create({
        key: "playerCoffeeJumpEnd",
        frames: [{ key: "coffeeJump_02" }],
        frameRate: 2.6,
        repeat: 0,
    });
    anims.create({
        key: "playerCoffeeDash",
        frames: [{ key: "coffeeDash_00" }, { key: "coffeeDash_01" }, { key: "coffeeDash_02" }, { key: "coffeeDash_03" }],
        frameRate: 8,
        repeat: -1,
    });

    anims.create({
        key: "playerCoffeeDied",
        frames: [{ key: "coffeeDie_00" }, { key: "coffeeDie_01" }],
        frameRate: 0.5,
        repeat: 0,
    });

    anims.create({
        key: "playerDragonIdle",
        frames: [{ key: "dragonWalk_00" }],
        frameRate: 20,
    });

    anims.create({
        key: "playerDragonWalk",
        frames: [{ key: "dragonWalk_00" }, { key: "dragonWalk_01" }, { key: "dragonWalk_02" }],
        frameRate: 5,
        repeat: -1,
    });

    anims.create({
        key: "playerDragonJumpStart",
        frames: [{ key: "dragonJump_00" }],
        frameRate: 2.6,
        repeat: 0,
    });
    anims.create({
        key: "playerDragonJumping",
        frames: [{ key: "dragonJump_01" }],
        frameRate: 1,
        repeat: -1,
    });
    anims.create({
        key: "playerDragonJumpEnd",
        frames: [{ key: "dragonJump_02" }],
        frameRate: 2.6,
        repeat: 0,
    });
    anims.create({
        key: "playerDragonDash",
        frames: [{ key: "dragonDash_00" }, { key: "dragonDash_01" }, { key: "dragonDash_02" }, { key: "dragonDash_03" }],
        frameRate: 8,
        repeat: -1,
    });

    anims.create({
        key: "playerDragonDied",
        frames: [{ key: "dragonDie_00" }, { key: "dragonDie_01" }],
        frameRate: 0.5,
        repeat: 0,
    });
}
