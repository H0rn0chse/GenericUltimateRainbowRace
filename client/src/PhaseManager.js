import { getId, send, addEventListener } from "./socket.js";
import { GameManager } from "./views/GameManager.js";
import { GameInstance } from "./GameInstance.js";
import { Timer } from "./Timer.js";

export const Phases = {
    Initial: "Intial",
    Colors: "Colors",
    Build: "Build",
    PreRun: "PreRun",
    Run: "Run",
    Results: "Results",
};

const PhaseTexts = {
    Initial: "Intial Setup",
    Colors: "Color are switching",
    Build: "Place your Block",
    PreRun: "Countdown",
    Run: "Run!",
    Results: "Results",
};

class _PhaseManager {
    constructor () {
        addEventListener("joinGame", this.onJoinGame, this);
        addEventListener("setPhase", this.onSetPhase, this);
        addEventListener("setCountdown", this.onSetCountdown, this);

        this.currentPhase = Phases.Initial;

        this.title = document.querySelector("#phaseTitle");
        this.title.innerText = this.currentPhase;

        this.countdown = document.querySelector("#phaseCountdown");

        this.isHost = false;
        this.remainingSeconds = 0;

        this.listener = {};
        Object.keys(Phases).forEach((key) => {
            this.listener[key] = [];
        });

        this.listen(Phases.Colors, this.onColors.bind(this));
        this.listen(Phases.Build, this.onBuild.bind(this));
        this.listen(Phases.PreRun, this.onPreRun.bind(this));
    }

    listen (phase, handler) {
        this.listener[phase].push(handler);
    }

    dispatch (phase, data) {
        this.listener[phase].forEach((handler) => {
            handler(data);
        });
    }

    isPhase (phase) {
        return this.currentPhase === phase;
    }

    onColors () {
        if (!this.isHost) {
            return;
        }

        setTimeout(() => {
            send("setPhase", { phase: Phases.Build });
        }, 1000);
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

    onBuild () {
        if (!this.isHost) {
            return;
        }

        this._startPhaseCountdown(4, Phases.PreRun);
    }

    onPreRun () {
        if (!this.isHost) {
            return;
        }

        this._startPhaseCountdown(4, Phases.Run);
    }

    onJoinGame (data) {
        this.isHost = data.host === getId();
        send("setPhase", { phase: Phases.Colors });
    }

    onSetPhase (data) {
        if (!GameManager.ingame) {
            return;
        }

        GameInstance.sceneDeferred.promise.then(() => {
            this.currentPhase = data.phase;
            this.title.innerText = PhaseTexts[this.currentPhase];

            this.dispatch(data.phase, data);
        });
    }

    onSetCountdown (data) {
        const seconds = data.seconds ? `&nbsp;&nbsp;${data.seconds}` : "";
        this.countdown.innerHTML = seconds;
    }
}

export const PhaseManager = new _PhaseManager();
globalThis.PhaseManager = PhaseManager;
