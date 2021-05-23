export const { Phaser, _ } = globalThis;

export const BLOCK_SIZE = 42;
export const BLOCKS_X = 30;
export const BLOCKS_Y = 13;

export const SCENE_WIDTH = BLOCKS_X * BLOCK_SIZE;
export const SCENE_HEIGHT = BLOCKS_Y * BLOCK_SIZE;

export const STATIC = 1;
export const DYNAMIC = 0;

export const BUILD_COUNTDOWN = 3;
export const PRERUN_COUNTDOWN = 1;
export const RESULTS_COUNTDOWN = 1;

export const LEVEL_TIMEOUT = 60;

export const SCORE_TICK = 0.2;
export const SCORE_START = 500;
export const SCORE_COIN = 200;
export const SCORE_FIRST = 100;

export const PLAYER_STATUS = {
    Alive: "Alive",
    Dead: "Dead",
    Idle: "Idle",
};

export const PHASES = {
    Initial: "Initial",
    PreRun: "PreRun",
    Run: "Run",
    Results: "Results",
    Colors: "Colors",
    Build: "Build",
};

export const PHASE_TEXTS = {
    Initial: "",
    PreRun: "Countdown",
    Run: "Run!",
    Results: "Results",
    Colors: "",
    Build: "Place your Block",
};

export const LEVELS = {
    0: {
        id: 0,
        name: "Level 0",
        baqround: "baqround2",
        preview: "./assets/preview/level_0.png",
    },
    1: {
        id: 1,
        name: "Level 1",
        baqround: "baqround5",
        preview: "./assets/preview/level_0.png",
    },
    2: {
        id: 2,
        name: "Level 2",
        baqround: "baqround4",
        preview: "./assets/preview/level_0.png",
    },
    3: {
        id: 3,
        name: "Level 3",
        baqround: "baqround1",
        preview: "./assets/preview/level_0.png",
    },
    4: {
        id: 4,
        name: "Level 4",
        baqround: "baqround2",
        preview: "./assets/preview/level_0.png",
    },
    5: {
        id: 5,
        name: "Level 5",
        baqround: "baqround3",
        preview: "./assets/preview/level_0.png",
    },
    6: {
        id: 6,
        name: "Level 6",
        baqround: "baqround4",
        preview: "./assets/preview/level_0.png",
    },
    7: {
        id: 7,
        name: "Level 7",
        baqround: "baqround5",
        preview: "./assets/preview/level_0.png",
    },
    8: {
        id: 8,
        name: "Level 8",
        baqround: "baqround4",
        preview: "./assets/preview/level_0.png",
    },
    9: {
        id: 9,
        name: "Level 9",
        baqround: "baqround2",
        preview: "./assets/preview/level_0.png",
    },
    10: {
        id: 10,
        name: "Level 10",
        baqround: "baqround1",
        preview: "./assets/preview/level_0.png",
    }
};
