import { GameInstance } from "./GameInstance.js";
// eslint-disable-next-line import/no-cycle
import { LobbyManager } from "./LobbyManager.js";
import { getId, send, addEventListener, removeEventListener } from "./socket.js";
import { Timer } from "./Timer.js";

class _GameManager {
    constructor () {
        this.lobbyName = "";
        this.ingame = false;

        this.game = document.querySelector("#game");
        this.points = document.querySelector("#gamePoints");

        this.game.style.display = "none";

        document.addEventListener("keydown", (evt) => {
            if (this.ingame) {
                // todo
            }
        });

        GameInstance.updateServer = (x, y) => {
            if (this.ingame) {
                const data = { pos: { x, y } };
                send("gamePosition", data);
            }
        };

        this.puppets = new Map();

        // GameInstance;
    }

    join (name) {
        this.lobbyName = name;
        this.ingame = true;
        this.game.style.display = "";

        send("joinGame", { name });

        addEventListener("gamePosition", this.onGamePosition, this);
        addEventListener("gameLeave", this.onGameLeave, this);
        addEventListener("gameInit", this.onGameInit, this);
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
}

export const GameManager = new _GameManager();
