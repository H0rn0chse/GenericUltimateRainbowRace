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
            { channel: "setBlock", handler: this.onSetBlock },
            { channel: "playerUpdate", handler: this.onPlayerUpdate },
            { channel: "playerRemoved", handler: this.onPlayerRemoved },
            { channel: "closeGame", handler: this.onCloseGame },
            { channel: "pickBlock", handler: this.onPickBlock },
            { channel: "fillInv", handler: this.onFillInv },
            { channel: "resetRun", handler: this.onResetRun },
            { channel: "kittyCollected", handler: this.onKittyCollected },
            { channel: "hideKitty", handler: this.onHideKitty },
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
        ScoreManager.stopTimer();
        PhaseManager.setTitle("Waiting for others...");

        if (!this.runEnded) {
            if (status === PLAYER_STATUS.Dead) {
                ScoreManager.clearScore();
            }

            const data = {
                status,
                score: ScoreManager.getScore(),
            };
            send("runEnd", data);
            this.runEnded = true;
        }
    }

    _updatePlayer (data) {
        send("playerUpdate", data);
    }

    updateBlock (data) {
        send("updateBlock", data);
    }

    setBlock (x, y, blockType, flipX, blockId) {
        const data = {
            pos: {
                x,
                y,
            },
            blockType,
            flipX,
            blockId,
        };
        send("setBlock", data);
    }

    sendInv (types) {
        const data = {
            types,
        };
        send("fillInv", data);
    }

    sendBlockChoice (block) {
        const data = {
            block,
        };
        console.log(`send${block}`);
        send("pickBlock", data);
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

    onKittyCollected (data) {
        GameBus.emit("kittyCollected", data.kittyId);
    }

    onHideKitty (data) {
        if (data.playerId !== getId()) {
            GameBus.emit("hideKitty", data.kittyId);
        }
    }

    onFillInv (data) {
        if (data.playerId === getId()) {
            return;
        }
        this.instance.fillInv(data.types);
    }

    onPickBlock (data) {
        if (data.playerId === getId()) {
            return;
        }
        console.log(data.block);
        this.instance.removeInventoryBlock(data.block);
    }

    onPlayerUpdate (data) {
        if (data.id === getId()) {
            return;
        }
        GameBus.emit("playerUpdated", data.id, data);
    }

    onSetBlock (data) {
        if (data.playerId === getId()) {
            GameBus.emit("updateBlockId", data);
        }
        GameBus.emit("setBlock", data);
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

    onUpdateBlock (data) {
        if (data.playerId !== getId()) {
            GameBus.emit("updateBlock", data);
        }
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
