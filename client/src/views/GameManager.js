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

        this.playerPuppets = new Map();

        this.gameHandler = [
            { channel: "setBlock", handler: this.onSetBlock },
            { channel: "playerUpdate", handler: this.onPlayerUpdate },
            { channel: "playerRemoved", handler: this.onPlayerRemoved },
            { channel: "closeGame", handler: this.onCloseGame },
        ];
    }

    show () {
        this.startListen();
        this.container.style.display = "";
    }

    hide () {
        this.ingame = false;
        this.stopListen();
        this.container.style.display = "none";
        GameInstance.destroyScenes();
    }

    updatePlayer (x, y, anim, flipX) {
        const data = {
            pos: {
                x,
                y,
            },
            flipX,
            anim,
        };
        send("playerUpdate", data);
    }

    setBlock (x, y, blockType) {
        const data = {
            pos: {
                x,
                y,
            },
            blockType,
        };
        send("setBlock", data);
    }

    onPlayerUpdate (data) {
        if (data.id === getId()) {
            return;
        }

        GameInstance.sceneDeferred.promise.then(() => {
            let playerId = this.playerPuppets.get(data.id);
            if (playerId === undefined) {
                playerId = this.playerPuppets.size;
                this.playerPuppets.set(data.id, playerId);
                GameInstance.createPlayer(playerId, data.pos.x, data.pos.y);
            }

            GameInstance.updatePlayer(playerId, data.pos.x, data.pos.y, data.anim, data.flipX);
        });
    }

    onSetBlock (data) {
        if (data.playerId === getId()) {
            return;
        }
        GameInstance.setBlock(data.pos.x, data.pos.y, data.blockType);
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
