import { GameInstance } from "../GameInstance.js";
import { ViewManager } from "../ViewManager.js";
import { getId, send, addEventListener, removeEventListener, ready } from "../socket.js";
import { PhaseManager } from "../PhaseManager.js";
import { AvatarManager } from "../AvatarManager.js";
import { DebugBus, GameBus } from "../EventBus.js";
import { PHASES, _ } from "../Globals.js";

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
        ];

        PhaseManager.listen(PHASES.Colors, this.onColors.bind(this));
        GameBus.on("sceneReady", this.onSceneReady, this);
    }

    // ========================================== Game logic & handler =============================================

    endRun (status) {
        if (!this.runEnded) {
            const data = {
                status,
            };
            send("runEnd", data);
            this.runEnded = true;
        }
    }

    _updatePlayer (data) {
        send("playerUpdate", data);
    }

    setBlock (x, y, blockType, flipX) {
        const data = {
            pos: {
                x,
                y,
            },
            blockType,
            flipX,
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
            return;
        }
        this.instance.setBlock(data.pos.x, data.pos.y, data.blockType, data.flipX);
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
