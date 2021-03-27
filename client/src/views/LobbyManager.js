import { addEventListener, removeEventListener, ready, send } from "../socket.js";
// eslint-disable-next-line import/no-cycle
import { ViewManager } from "../ViewManager.js";

class _LobbyManager {
    constructor () {
        this.container = document.querySelector("#lobby");
        this.list = document.querySelector("#lobbyList");
        this.name = "";

        const startButton = document.querySelector("#lobbyStart");
        startButton.addEventListener("click", (evt) => {
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
        this.name = "";
        this.list.innerHTML = "";
    }

    onPlayerAdded (data) {
        this.list.innerHTML += `<br>Add:<br> ${JSON.stringify(data)}`;
    }

    onPlayerRemoved (data) {
        this.list.innerHTML += `<br>Remove:<br> ${JSON.stringify(data)}`;
    }

    onCloseLobby () {
        ViewManager.showOverview();
    }

    onJoinLobby (data) {
        this.list.innerHTML = JSON.stringify(data.player);
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
