import { addEventListener, removeEventListener, send, ready } from "../socket.js";
import { LobbyManager } from "./LobbyManager.js";
import { OverviewEntry } from "../domElements/OverviewEntry.js";

class _OverviewManager {
    constructor () {
        this.container = document.querySelector("#sectionOverview");
        this.listNode = document.querySelector("#overviewLobbyList");
        this.name = document.querySelector("#overviewLobbyName");

        const createButton = document.querySelector("#overviewCreateLobby");
        createButton.addEventListener("click", (evt) => {
            this.createLobby();
        });

        const debugButton = document.querySelector("#overviewDebug");
        debugButton.addEventListener("click", (evt) => {
            this.name.value = "debugGame";
            this.createLobby();
            LobbyManager.startLobby();
        });

        this.name.value = "";
        this.name.addEventListener("keydown", (evt) => {
            if (evt.key === "Enter") {
                this.createLobby();
            }
        });

        this.gameHandler = [
            { channel: "lobbyAdded", handler: this.onLobbyAdded },
            { channel: "lobbyRemoved", handler: this.onLobbyRemoved },
        ];

        // initial state
        this.lobbyList = {};
        ready().then(() => {
            this.startListen();
        });
    }

    // ========================================== Manager logic & handler =============================================

    createLobby () {
        if (this.name.value) {
            send("createLobby", { name: this.name.value });
        } else {
            // Resetting CSS animation each time
            // https://css-tricks.com/restart-css-animation/
            this.name.classList.remove("invalid");
            void this.name.offsetWidth;
            this.name.classList.add("invalid");
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
        this.container.classList.remove("section--hidden");
    }

    hide () {
        this.resetList();
        this.stopListen();
        this.container.classList.add("section--hidden");
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
