import { addEventListener, removeEventListener, ready, send, getId } from "../socket.js";
// eslint-disable-next-line import/no-cycle
import { ViewManager } from "../ViewManager.js";

class _LobbyManager {
    constructor () {
        this.container = document.querySelector("#lobby");
        this.title = document.querySelector("#lobbyName");
        this.list = document.querySelector("#lobbyList");

        this.startButton = document.querySelector("#lobbyStart");
        this.startButton.addEventListener("click", (evt) => {
            this.startLobby();
        });

        // initial state
        ready().then(() => {
            addEventListener("joinLobby", this.onJoinLobby, this);
        });
    }

    show () {
        this.startListen();
        this.container.style.display = "";
    }

    hide () {
        this.resetLobby();
        this.stopListen();
        this.container.style.display = "none";
    }

    startLobby () {
        send("startLobby", {});
    }

    resetLobby () {
        this.title.innerText = "";
        this.list.innerHTML = "";
    }

    onPlayerAdded (playerData) {
        const row = document.createElement("div");
        row.classList.add("flexRow", "lobbyRow");
        row.setAttribute("data-id", playerData.id);

        const name = document.createElement("div");
        name.innerText = playerData.name;
        row.appendChild(name);

        this.list.appendChild(row);
    }

    onPlayerRemoved (playerData) {
        const row = this.list.querySelector(`div[data-id="${playerData.id}"]`);
        if (row) {
            row.remove();
        }
    }

    onCloseLobby () {
        ViewManager.showOverview();
    }

    onJoinLobby (data) {
        this.title.innerText = data.name;
        if (getId() !== data.host) {
            this.startButton.disabled = true;
        }
        Object.values(data.player).forEach((playerData) => {
            this.onPlayerAdded(playerData);
        });
        ViewManager.showLobby();
    }

    stopListen () {
        addEventListener("joinLobby", this.onJoinLobby, this);

        removeEventListener("playerAdded", this.onPlayerAdded, this);
        removeEventListener("playerRemoved", this.onPlayerRemoved, this);
        removeEventListener("closeLobby", this.onCloseLobby, this);
    }

    startListen () {
        removeEventListener("joinLobby", this.onJoinLobby, this);

        addEventListener("playerAdded", this.onPlayerAdded, this);
        addEventListener("playerRemoved", this.onPlayerRemoved, this);
        addEventListener("closeLobby", this.onCloseLobby, this);
    }
}

export const LobbyManager = new _LobbyManager();
globalThis.LobbyManager = LobbyManager;
