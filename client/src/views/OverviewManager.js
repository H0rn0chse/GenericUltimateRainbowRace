import { addEventListener, removeEventListener, send, ready } from "../socket.js";
// eslint-disable-next-line import/no-cycle
import { LobbyManager } from "./LobbyManager.js";

class _OverviewManager {
    constructor () {
        this.container = document.querySelector("#overview");
        this.list = document.querySelector("#overviewList");
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

        // initial state
        ready().then(() => {
            this.startListen();
        });
    }

    show () {
        this.startListen();
        this.container.style.display = "";
    }

    hide () {
        this.resetList();
        this.stopListen();
        this.container.style.display = "none";
    }

    createLobby () {
        if (this.name.value) {
            send("createLobby", { name: this.name.value });
        }
    }

    resetList () {
        this.list.innerHTML = "";
        this.name.value = "";
    }

    onLobbyAdded (lobby) {
        const row = document.createElement("div");
        row.classList.add("flexRow", "lobbyRow");
        row.setAttribute("data-name", lobby.name);

        const name = document.createElement("div");
        name.innerText = lobby.name;
        row.appendChild(name);

        const button = document.createElement("button");
        button.innerText = "Join Game";
        button.addEventListener("click", (evt) => {
            send("joinLobby", { name: lobby.name });
        });
        row.appendChild(button);

        this.list.appendChild(row);
    }

    onLobbyRemoved (lobby) {
        const row = this.list.querySelector(`div[data-name=${lobby.name}]`);
        if (row) {
            row.remove();
        }
    }

    onLobbyList (data) {
        if (Array.isArray(data)) {
            data.forEach((entry) => {
                this.onLobbyAdded({ name: entry });
            });
        }
        removeEventListener("lobbyList", this.onLobbyList);
    }

    stopListen () {
        removeEventListener("lobbyAdded", this.onLobbyAdded, this);
        removeEventListener("lobbyRemoved", this.onLobbyRemoved, this);
        send("unsubscribeOverview");
    }

    startListen () {
        addEventListener("lobbyList", this.onLobbyList, this);
        addEventListener("lobbyAdded", this.onLobbyAdded, this);
        addEventListener("lobbyRemoved", this.onLobbyRemoved, this);
        send("subscribeOverview");
    }
}

export const OverviewManager = new _OverviewManager();
