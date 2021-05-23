import { getId, send, addEventListener } from "./socket.js";
import { GameManager } from "./views/GameManager.js";
import { ScoreManager } from "./views/ScoreManager.js";
import { Timer } from "./Timer.js";
import { PHASES, PHASE_TEXTS, PRERUN_COUNTDOWN, BUILD_COUNTDOWN, RESULTS_COUNTDOWN } from "./Globals.js";
import { PhaseBus } from "./EventBus.js";

class _PhaseManager {
    constructor () {
        addEventListener("lobbyReady", this.onLobbyReady, this);
        addEventListener("setPhase", this.onSetPhase, this);
        addEventListener("setCountdown", this.onSetCountdown, this);
        addEventListener("runProgress", this.onRunProgress, this);
        addEventListener("runEnd", this.onRunEnd, this);
        addEventListener("allBlocksSet", this.onAllBlocksSet, this);

        this.currentPhase = PHASES.Initial;

        this.title = document.querySelector("#phaseTitle");
        this.title.innerText = PHASE_TEXTS[this.currentPhase];

        this.countdown = document.querySelector("#phaseCountdown");

        this.isHost = false;
        this.remainingSeconds = 0;

        PhaseBus.on(PHASES.Colors, this.onColors, this);
        PhaseBus.on(PHASES.Build, this.onBuild, this);
        PhaseBus.on(PHASES.PreRun, this.onPreRun, this);
        PhaseBus.on(PHASES.Run, this.onRun, this);
    }

    isPhase (phase) {
        return this.currentPhase === phase;
    }

    setTitle (title) {
        this.title.innerText = title;
    }

    _startPhaseCountdown (seconds, phase) {
        this.remainingSeconds = seconds;

        const timer = new Timer(1, () => {
            send("setCountdown", { seconds: this.remainingSeconds });

            if (this.remainingSeconds > 0) {
                this.remainingSeconds -= 1;
                timer.start();
            } else {
                send("setPhase", { phase });
            }
        });
        timer.start();
        send("setCountdown", { seconds: this.remainingSeconds + 1 });
    }

    onColors () {
        if (!this.isHost) {
            return;
        }

        setTimeout(() => {
            send("setPhase", { phase: PHASES.Build });
        }, 1000);
    }

    onBuild () {
        if (!this.isHost) {
            return;
        }

        this._startPhaseCountdown(BUILD_COUNTDOWN, PHASES.PreRun);
    }

    onPreRun () {
        if (!this.isHost) {
            return;
        }

        this._startPhaseCountdown(PRERUN_COUNTDOWN, PHASES.Run);
    }

    onRun () {
        if (!this.isHost) {
            return;
        }

        send("resetRun", {});
    }

    onRunProgress (data) {
        console.log(data);
    }

    onRunEnd (data) {
        if (!this.isHost) {
            return;
        }
        ScoreManager.stopTimer();

        setTimeout(() => {
            data.phase = PHASES.Results;
            send("setPhase", data);
        }, RESULTS_COUNTDOWN * 1000);
    }

    onLobbyReady (data) {
        this.isHost = data.host === getId();

        if (!this.isHost) {
            return;
        }
        send("setPhase", { phase: PHASES.Colors });
    }

    onSetPhase (data) {
        if (!GameManager.ingame) {
            return;
        }

        this.currentPhase = data.phase;
        this.setTitle(PHASE_TEXTS[this.currentPhase]);

        PhaseBus.emit(data.phase, data);
    }

    onSetCountdown (data) {
        const seconds = data.seconds ? `&nbsp;&nbsp;${data.seconds}` : "";
        this.countdown.innerHTML = seconds;
    }

    onAllBlocksSet (data) {
        this.remainingSeconds = 1;
    }
}

export const PhaseManager = new _PhaseManager();
globalThis.PhaseManager = PhaseManager;
