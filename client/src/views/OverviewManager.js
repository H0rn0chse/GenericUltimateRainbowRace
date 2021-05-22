import { addEventListener, removeEventListener, send, ready, getName, setName } from "../socket.js";
import { LobbyManager } from "./LobbyManager.js";
import { OverviewEntry } from "../domElements/OverviewEntry.js";

class _OverviewManager {
    constructor () {
        this.container = document.querySelector("#overview");
        this.listNode = document.querySelector("#overviewList");
        this.name = document.querySelector("#overviewName");

        const createButton = document.querySelector("#createOverview");
        createButton.addEventListener("click", (evt) => {
            this.createLobby();
        });

        const debugButton = document.querySelector("#debugGame");
        debugButton.addEventListener("click", (evt) => {
            this.name.value = "debugGame";
            this.createLobby();
            LobbyManager.startLobby();
        });

        this.usernameInput = document.querySelector("#overviewUsername");
        this.usernameInput.addEventListener("change", (evt) => {
            if (this.usernameInput.value) {
                setName(this.usernameInput.value);
                send("userNameUpdate", { name: this.usernameInput.value });
            }
        });

        this.gameHandler = [
            { channel: "lobbyAdded", handler: this.onLobbyAdded },
            { channel: "lobbyRemoved", handler: this.onLobbyRemoved },
        ];

        // initial state
        this.usernameInput.value = getName();
        this.lobbyList = {};
        ready().then(() => {
            this.startListen();
        });
    }

    // ========================================== Manager logic & handler =============================================

    createLobby () {
        if (this.name.value) {
            send("createLobby", { name: this.name.value });
        }
    }

    resetList () {
        this.listNode.innerHTML = "";
        this.name.value = "";
        this.lobbyList = {};
    }

    joinLobby (lobbyId) {
        send("joinLobby", { id: lobbyId });
    }

    // ========================================== Phase / EventBus handler =============================================

    // ========================================== Websocket handler =============================================

    onLobbyAdded (lobby) {
        const lobbyId = lobby.id;

        if (this.lobbyList[lobbyId]) {
            return;
        }

        const entry = new OverviewEntry(lobbyId);
        entry.update(lobby.name);

        this.lobbyList[lobbyId] = entry;
        this.listNode.appendChild(entry.row);
    }

    onLobbyRemoved (lobby) {
        const lobbyId = lobby.id;

        const entry = this.lobbyList[lobbyId];
        if (entry) {
            entry.row.remove();
            delete this.lobbyList[lobbyId];
        }
    }

    onLobbyList (data) {
        if (Array.isArray(data)) {
            data.forEach((entry) => {
                this.onLobbyAdded(entry);
            });
        }
        removeEventListener("lobbyList", this.onLobbyList);
    }

    // ========================================== Basic Manager Interface =============================================

    show () {
        this.startListen();
        this.container.style.display = "";
        this.usernameInput.value = getName();
    }

    hide () {
        this.resetList();
        this.stopListen();
        this.container.style.display = "none";
    }

    stopListen () {
        this.gameHandler.forEach((data) => {
            removeEventListener(data.channel, data.handler, this);
        });

        send("unsubscribeOverview");
    }

    startListen () {
        addEventListener("lobbyList", this.onLobbyList, this);
        this.gameHandler.forEach((data) => {
            addEventListener(data.channel, data.handler, this);
        });

        send("subscribeOverview");
    }
}

export const OverviewManager = new _OverviewManager();
