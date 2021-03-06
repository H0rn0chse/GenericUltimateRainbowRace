import { OverviewManager } from "./views/OverviewManager.js";
import { GameManager } from "./views/GameManager.js";
import { LobbyManager } from "./views/LobbyManager.js";

// Sub Views need to be instantiated
import { ResultsManager } from "./views/ResultsManager.js";
import { ScoreManager } from "./views/ScoreManager.js";
import { SoundManager } from "./views/SoundManager.js";
import { CommonBus } from "./EventBus.js";

class _ViewManager {
    constructor () {
        this.hidden = {
            OverviewManager: false,
            GameManager: true,
            LobbyManager: true,
        };
    }

    showOverview () {
        if (!this.hidden.OverviewManager) {
            return;
        }
        OverviewManager.show();
        this.hidden.OverviewManager = false;

        if (!this.hidden.GameManager) {
            GameManager.hide();
            this.hidden.GameManager = true;
        }
        if (!this.hidden.LobbyManager) {
            LobbyManager.hide();
            this.hidden.LobbyManager = true;
        }
    }

    showLobby () {
        if (!this.hidden.LobbyManager) {
            return;
        }
        LobbyManager.show();
        this.hidden.LobbyManager = false;

        if (!this.hidden.GameManager) {
            GameManager.hide();
            this.hidden.GameManager = true;
        }
        if (!this.hidden.OverviewManager) {
            OverviewManager.hide();
            this.hidden.OverviewManager = true;
        }
    }

    showGame () {
        if (!this.hidden.GameManager) {
            return;
        }
        GameManager.show();
        this.hidden.GameManager = false;

        if (!this.hidden.LobbyManager) {
            LobbyManager.hide();
            this.hidden.LobbyManager = true;
        }
        if (!this.hidden.OverviewManager) {
            OverviewManager.hide();
            this.hidden.OverviewManager = true;
        }
    }
}

export const ViewManager = new _ViewManager();
globalThis.ViewManager = ViewManager;
