import { GameInstance } from "../GameInstance.js";
import { ViewManager } from "../ViewManager.js";
import { getId, send, addEventListener, removeEventListener, ready } from "../socket.js";
import { PhaseManager } from "../PhaseManager.js";
import { AvatarManager } from "../AvatarManager.js";
import { ScoreManager } from "./ScoreManager.js";
import { DebugBus, GameBus, PhaseBus } from "../EventBus.js";
import { PHASES, PLAYER_STATUS, _ } from "../Globals.js";

export const Status = {
    Alive: "Alive",
    Dead: "Dead",
};

class _GameManager {
    constructor () {
        this.lobbyName = "";
        this.ingame = false;

        this.container = document.querySelector("#game");
        this.instanceContainer = document.querySelector("#gameArea");

        this.settingsBtnShow = document.querySelector("#gameSettingsShow");
        this.settingsBtnHide = document.querySelector("#gameSettingsHide");
        this.gameSettingsCollapsible = document.querySelector("#gameSettingsCollapsible");
        this.settingsBtnShow.addEventListener("click", (evt) => {
            this.gameSettingsCollapsible.classList.remove("hidden");
            this.settingsBtnShow.classList.add("hidden");
            this.settingsBtnHide.classList.remove("hidden");
        });
        this.settingsBtnHide.addEventListener("click", (evt) => {
            this.gameSettingsCollapsible.classList.add("hidden");
            this.settingsBtnShow.classList.remove("hidden");
            this.settingsBtnHide.classList.add("hidden");
        });

        this.debugCbx = document.querySelector("#debugCbx");
        this.debugCbx.addEventListener("change", (evt) => {
            DebugBus.emit("setDebug", this.debugCbx.checked);
        });

        this.instance = null;
        this.runEnded = true;

        this.updatePlayer = _.throttle(this._updatePlayer, 100);

        // initial state
        ready().then(() => {
            addEventListener("joinGame", this.onJoinGame, this);
        });

        this.gameHandler = [
            { channel: "playerUpdate", handler: this.onPlayerUpdate },
            { channel: "playerRemoved", handler: this.onPlayerRemoved },
            { channel: "closeGame", handler: this.onCloseGame },
            { channel: "resetRun", handler: this.onResetRun },
            { channel: "kittyCollected", handler: this.onKittyCollected },
            { channel: "hideKitty", handler: this.onHideKitty },
            // inventory & blocks
            { channel: "fillInventory", handler: this.onFillInventory },
            { channel: "selectBlock", handler: this.onSelectBlock },
            { channel: "placeBlock", handler: this.onPlaceBlock },
            { channel: "updateBlock", handler: this.onUpdateBlock },
        ];

        PhaseBus.on(PHASES.Colors, this.onColors, this);
        GameBus.on("sceneReady", this.onSceneReady, this);
    }

    // ========================================== Game logic & handler =============================================

    collectKitty (kittyId) {
        send("collectKitty", { kittyId });
    }

    endRun (status) {
        PhaseManager.setTitle("Waiting for others...");

        if (!this.runEnded) {
            if (status === PLAYER_STATUS.Dead) {
                // clear score
            }

            const data = {
                status,
                score: 0,
            };
            send("runEnd", data);
            this.runEnded = true;
        }
    }

    fillInventory (data) {
        GameBus.emit("fillInventory", data);
        send("fillInventory", data);
    }

    selectBlock (blockId) {
        const data = {
            blockId,
        };
        GameBus.emit("selectBlock", data);
        send("selectBlock", data);
    }

    placeBlock (data) {
        GameBus.emit("placeBlock", data);
        send("placeBlock", data);
    }

    updateBlock (data) {
        send("updateBlock", data);
    }

    _updatePlayer (data) {
        send("playerUpdate", data);
    }

    nextGame () {
        send("setPhase", { phase: PHASES.Colors });
    }

    stopGame () {
        send("stopGame", {});
    }

    leaveGame () {
        send("leaveGame", {});
        ViewManager.showOverview();
    }

    getGameInstanceConfig () {
        if (!this.lobbyData) {
            return;
        }

        const playerData = this.lobbyData.player[getId()];

        return {
            skinId: playerData.avatarId || AvatarManager.getDefault(),
            levelId: this.lobbyData.levelId,
        };
    }

    // ========================================== Phase / EventBus handler =============================================

    onColors () {
        this.instance.resetMainScene();
    }

    onSceneReady () {
        send("playerReady", {});
    }

    // ========================================== Websocket handler =============================================

    onFillInventory (data) {
        if (data.playerId !== getId()) {
            GameBus.emit("fillInventory", data);
        }
    }

    onSelectBlock (data) {
        if (data.playerId !== getId()) {
            GameBus.emit("selectBlock", data);
        }
    }

    onPlaceBlock (data) {
        if (data.playerId !== getId()) {
            GameBus.emit("placeBlock", data);
        }
    }

    onUpdateBlock (data) {
        if (data.playerId !== getId()) {
            GameBus.emit("updateBlock", data);
        }
    }

    onKittyCollected (data) {
        GameBus.emit("kittyCollected", data.kittyId);
    }

    onHideKitty (data) {
        if (data.playerId !== getId()) {
            GameBus.emit("hideKitty", data.kittyId);
        }
    }

    onPlayerUpdate (data) {
        if (data.id === getId()) {
            return;
        }
        GameBus.emit("playerUpdated", data.id, data);
    }

    onJoinGame (data) {
        this.lobbyName = data.name;
        this.lobbyData = data;
        this.ingame = true;

        ViewManager.showGame();

        Object.values(data.player).forEach((playerData) => {
            if (playerData.id === getId()) {
                return;
            }

            GameBus.emit("playerUpdated", playerData.id, playerData);
        });
    }

    onPlayerRemoved (data) {
        GameBus.emit("playerRemoved", data.id);
    }

    onCloseGame (data) {
        console.log("host left the game", data);
        ViewManager.showOverview();
    }

    onResetRun () {
        this.runEnded = false;
    }

    // ========================================== Basic Manager Interface =============================================

    show () {
        this.startListen();
        this.container.style.display = "";

        this.instance = new GameInstance(this.instanceContainer, this);
    }

    hide () {
        this.ingame = false;
        this.stopListen();
        this.container.style.display = "none";

        this.instance.destroy();
        this.instance = null;
    }

    stopListen () {
        addEventListener("joinGame", this.onJoinGame, this);

        this.gameHandler.forEach((data) => {
            removeEventListener(data.channel, data.handler, this);
        });
    }

    startListen () {
        removeEventListener("joinGame", this.onJoinGame, this);

        this.gameHandler.forEach((data) => {
            addEventListener(data.channel, data.handler, this);
        });
    }
}

export const GameManager = new _GameManager();
globalThis.GameManager = GameManager;
