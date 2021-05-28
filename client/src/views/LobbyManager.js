import { addEventListener, removeEventListener, ready, send, getId, getName, setName } from "../socket.js";
import { ViewManager } from "../ViewManager.js";
import { LobbyEntry } from "../domElements/LobbyEntry.js";
import { LEVELS } from "../Globals.js";

class _LobbyManager {
    constructor () {
        this.container = document.querySelector("#sectionLobby");
        this.containerLevelSettings = document.querySelector("#sectionLevelSettings");

        this.title = document.querySelector("#lobbyName");
        this.listNode = document.querySelector("#lobbyPlayerList");

        this.startBtn = document.querySelector("#lobbyStart");
        this.startBtn.addEventListener("click", (evt) => {
            this.startLobby();
        });

        const leaveBtn = document.querySelector("#lobbyLeave");
        leaveBtn.addEventListener("click", (evt) => {
            this.leaveLobby();
        });

        this.levelPreview = document.querySelector("#levelPreview");
        this.levelSelect = document.querySelector("#levelSelect");
        Object.values(LEVELS).forEach((levelData) => {
            const option = document.createElement("option");
            option.innerText = levelData.name;
            option.setAttribute("value", levelData.id);
            this.levelSelect.appendChild(option);
        });
        this.levelSelect.addEventListener("change", (evt) => {
            this.selectLevel(this.levelSelect.value);
        });

        this.isHost = false;
        this.playerList = {};

        this.gameHandler = [
            { channel: "playerUpdated", handler: this.onPlayerUpdated },
            { channel: "playerAdded", handler: this.onPlayerAdded },
            { channel: "playerRemoved", handler: this.onPlayerRemoved },
            { channel: "closeLobby", handler: this.onCloseLobby },
            { channel: "levelUpdated", handler: this.onLevelUpdated },
        ];

        // initial state
        ready().then(() => {
            addEventListener("joinLobby", this.onJoinLobby, this);
        });
    }

    // ========================================== Manager logic & handler =============================================

    startLobby () {
        send("startLobby", {});
    }

    kickPlayer (playerId) {
        send("kickPlayer", { id: playerId });
    }

    leaveLobby () {
        send("leaveLobby", {});
        ViewManager.showOverview();
    }

    selectLevel (levelId) {
        console.log("selecting a level", levelId);
        send("selectLevel", { levelId });
    }

    resetLobby () {
        this.title.innerText = "";
        this.playerList = {};
        this.listNode.innerHTML = "";
    }

    // ========================================== Websocket handler =============================================

    onPlayerAdded (playerData, isHost = false) {
        const playerId = playerData.id;

        if (this.playerList[playerId]) {
            return;
        }

        const entry = new LobbyEntry(playerId, isHost, playerId === getId());
        entry.update(playerData.name, playerData.avatarId);

        this.playerList[playerId] = entry;
        this.listNode.appendChild(entry.row);
    }

    onPlayerRemoved (playerData) {
        const playerId = playerData.id;

        if (playerId === getId()) {
            console.log("player got kicked");
            ViewManager.showOverview();
        }

        const entry = this.playerList[playerId];
        if (entry) {
            entry.row.remove();
            delete this.playerList[playerId];
        }
    }

    onPlayerUpdated (playerData) {
        const entry = this.playerList[playerData.id];
        if (entry) {
            entry.update(playerData.name, playerData.avatarId);
        }
    }

    onLevelUpdated (data) {
        this.levelSelect.value = data.levelId;
        this.levelPreview.src = LEVELS[data.levelId].preview;
    }

    onCloseLobby () {
        ViewManager.showOverview();
    }

    onJoinLobby (data) {
        this.isHost = getId() === data.host;
        this.title.innerText = data.name;
        this.startBtn.disabled = !this.isHost;
        this.levelSelect.disabled = !this.isHost;

        this.levelSelect.value = data.levelId;
        this.levelPreview.src = LEVELS[data.levelId].preview;

        Object.values(data.player).forEach((playerData) => {
            const isHost = playerData.id === data.host;
            this.onPlayerAdded(playerData, isHost);
        });
        ViewManager.showLobby();
    }

    // ========================================== Basic Manager Interface =============================================

    show () {
        this.startListen();
        this.container.classList.remove("section--hidden");
        this.containerLevelSettings.classList.remove("section--hidden");
    }

    hide () {
        this.resetLobby();
        this.stopListen();
        this.container.classList.add("section--hidden");
        this.containerLevelSettings.classList.add("section--hidden");
    }

    stopListen () {
        addEventListener("joinLobby", this.onJoinLobby, this);

        this.gameHandler.forEach((data) => {
            removeEventListener(data.channel, data.handler, this);
        });
    }

    startListen () {
        removeEventListener("joinLobby", this.onJoinLobby, this);

        this.gameHandler.forEach((data) => {
            addEventListener(data.channel, data.handler, this);
        });
    }
}

export const LobbyManager = new _LobbyManager();
globalThis.LobbyManager = LobbyManager;
