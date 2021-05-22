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

export const SCORE_TICK = 0.2;
export const SCORE_START = 500;
export const SCORE_COIN = 200;
export const SCORE_FIRST = 100;

export const PLAYER_STATUS = {
    Alive: "Alive",
    Dead: "Dead",
};

export const PHASES = {
    Initial: "Intial",
    PreRun: "PreRun",
    Run: "Run",
    Results: "Results",
    Colors: "Colors",
    Build: "Build",
};

export const PHASE_TEXTS = {
    Initial: "Intial Setup",
    PreRun: "Countdown",
    Run: "Run!",
    Results: "Results",
    Colors: "Switching Colors",
    Build: "Place your Block",
};

export const LEVELS = {
    0: {
        id: 0,
        name: "The first Level",
        preview: "./assets/preview/level_0.png",
    },
    1: {
        id: 1,
        name: "The second Level",
        preview: "./assets/preview/level_1.png",
    },
};
