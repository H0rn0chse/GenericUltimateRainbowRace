import { PhaseBus } from "../EventBus.js";
import { LEVEL_TIMEOUT, PHASES, PLAYER_STATUS } from "../Globals.js";
import { Timer } from "../Timer.js";
import { GameManager } from "./GameManager.js";

class _ScoreManager {
    constructor () {
        this.container = document.querySelector("#gameStats");
        this.text = document.querySelector("#score");

        this.timeLeft = 0;
        this.running = false;
        this.timer = new Timer(1, this.onTick.bind(this));

        PhaseBus.on(PHASES.Run, this.onRun, this);
        PhaseBus.on(PHASES.Colors, this.onColors, this);
    }

    // ========================================== Manager logic & handler =============================================

    clearTime () {
        this.timeLeft = 0;
        this.updateTime();
    }

    resetTime () {
        this.timeLeft = LEVEL_TIMEOUT;
        this.updateTime();
    }

    updateTime () {
        this.text.innerText = this.timeLeft;
    }

    startTimer () {
        this.running = true;
        this.timer.start();
    }

    stopTimer () {
        this.running = false;
    }

    getTime () {
        return this.timeLeft;
    }

    onTick () {
        if (this.running) {
            if (this.timeLeft > 0) {
                this.timeLeft -= 1;
                this.updateTime();
            } else {
                GameManager.endRun(PLAYER_STATUS.Idle);
            }

            this.startTimer();
        }
    }

    // ========================================== Phase / EventBus handler =============================================

    onColors (data) {
        this.resetTime();
    }

    onRun (data) {
        this.startTimer();
    }

    // ========================================== Websocket handler =============================================
}

export const ScoreManager = new _ScoreManager();
globalThis.ScoreManager = ScoreManager;
