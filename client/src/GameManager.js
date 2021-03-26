import { GameInstance } from "./GameInstance.js";
// eslint-disable-next-line import/no-cycle
import { LobbyManager } from "./LobbyManager.js";
import { getId, send, addEventListener, removeEventListener } from "./socket.js";
import { Timer } from "./Timer.js";

class _GameManager {
    constructor () {
        this.currentPos = {
            x: 0,
            y: 0,
        };

        this.currentPoints = 0;

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
        // send("gamePosition", { pos: this.currentPos });
    }

    leave () {
        this.ingame = false;
        // removeEventListener("gamePosition", this.onGamePosition);
        // removeEventListener("gameLeave", this.onGameLeave);
        // removeEventListener("gameInit", this.onGameInit);
        send("gameLeave", {});
    }

    onGamePosition (data) {
        // todo
    }

    onGameLeave (data) {
        // todo
    }

    onGameInit (lobbyData) {
        // todo
    }
}

export const GameManager = new _GameManager();
