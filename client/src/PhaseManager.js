import { getId, send, addEventListener, removeEventListener } from "./socket.js";
import { GameManager } from "./views/GameManager.js";
import { GameInstance } from "./GameInstance.js";

export const Phases = {
    Initial: "Intial",
    Colors: "Colors",
    Build: "Build",
    Run: "Run",
    Results: "Results",
};

class _PhaseManager {
    constructor () {
        addEventListener("joinGame", this.onJoinGame, this);
        addEventListener("setPhase", this.onSetPhase, this);

        this.isHost = false;

        this.currentPhase = Phases.Initial;

        this.listener = {};
        Object.keys(Phases).forEach((key) => {
            this.listener[key] = [];
        });
    }

    listen (phase, handler) {
        this.listener[phase].push(handler);
    }

    dispatch (phase, data) {
        this.listener[phase].forEach((handler) => {
            handler(data);
        });
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
            this.dispatch(data.phase, data);
        });
    }
}

export const PhaseManager = new _PhaseManager();
globalThis.PhaseManager = PhaseManager;
