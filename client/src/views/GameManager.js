import { GameInstance } from "../GameInstance.js";
// eslint-disable-next-line import/no-cycle
import { ViewManager } from "../ViewManager.js";
import { getId, send, addEventListener, removeEventListener, ready } from "../socket.js";
import { Timer } from "../Timer.js";

class _GameManager {
    constructor () {
        this.lobbyName = "";
        this.ingame = false;

        this.container = document.querySelector("#game");
        this.points = document.querySelector("#gamePoints");

        document.addEventListener("keydown", (evt) => {
            if (this.ingame) {
                // todo
            }
        });

        // initial state
        ready().then(() => {
            addEventListener("joinGame", this.onJoinGame, this);
        });

        GameInstance.updateServer = (x, y) => {
            if (this.ingame) {
                const data = { pos: { x, y } };
                send("gamePosition", data);
            }
        };

        this.puppets = new Map();
    }

    show () {
        this.startListen();
        this.container.style.display = "";
    }

    hide () {
        this.stopListen();
        this.container.style.display = "none";
    }

    leave () {
        this.ingame = false;
        removeEventListener("gamePosition", this.onGamePosition);
        removeEventListener("gameLeave", this.onGameLeave);
        removeEventListener("gameInit", this.onGameInit);
        send("gameLeave", {});
    }

    onGamePosition (data) {
        if (data.id === getId()) {
            return;
        }

        let playerId = this.puppets.get(data.id);
        if (playerId === undefined) {
            playerId = this.puppets.size;
            this.puppets.set(data.id, playerId);
            GameInstance.createPlayer(playerId, data.pos.x, data.pos.y);
        }

        GameInstance.movePlayer(playerId, data.pos.x, data.pos.y);
    }

    onGameLeave (data) {
        // todo
    }

    onGameInit (lobbyData) {
        lobbyData.forEach((playerData) => {
            this.onGamePosition(playerData);
        });
    }

    onJoinGame (data) {
        this.lobbyName = data.name;
        this.ingame = true;

        GameInstance.createScene();
        ViewManager.showGame();
    }

    onPlayerRemoved (data) {
        console.log("player left the game", data);
    }

    onCloseGame (data) {
        console.log("host left the game", data);
        ViewManager.showOverview();
    }

    stopListen () {
        addEventListener("joinGame", this.onJoinGame, this);

        removeEventListener("playerRemoved", this.onPlayerRemoved, this);
        removeEventListener("closeGame", this.onCloseGame, this);
    }

    startListen () {
        removeEventListener("joinGame", this.onJoinGame, this);

        addEventListener("playerRemoved", this.onPlayerRemoved, this);
        addEventListener("closeGame", this.onCloseGame, this);
    }
}

export const GameManager = new _GameManager();
