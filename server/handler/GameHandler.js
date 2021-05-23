import { LobbyManager } from "../LobbyManager.js";
import { PlayerManager } from "../PlayerManager.js";
import { OverviewHandler } from "./OverviewHandler.js";
import { publish, registerMessageHandler, send, unsubscribe } from "../socket.js";
import { PLAYER_STATUS, SCORE_FIRST } from "../../client/src/Globals.js";
import { guid } from "../../client/src/utils.js";

class _GameHandler {
    init () {
        // leave by intention
        registerMessageHandler("leaveGame", this.onLeaveGame, this);
        // leave by disconnect
        registerMessageHandler("close", this.onLeaveGame, this);
        registerMessageHandler("playerUpdate", this.onPlayerUpdate, this);
        registerMessageHandler("stopGame", this.onStopGame, this);
        /*
            Here comes game logic listener...
        */
        registerMessageHandler("playerReady", this.onPlayerReady, this);
        registerMessageHandler("setBlock", this.onSetBlock, this);
        registerMessageHandler("setPhase", this.onSetPhase, this);
        registerMessageHandler("setCountdown", this.onSetCountdown, this);
        registerMessageHandler("pickBlock", this.onPickBlock, this);
        registerMessageHandler("fillInv", this.onFillInv, this);
        registerMessageHandler("resetRun", this.onResetRun, this);
        registerMessageHandler("runEnd", this.onRunEnd, this);
        registerMessageHandler("collectKitty", this.onCollectKitty, this);
    }

    _getLobbyData (playerId) {
        const name = PlayerManager.getProperty(playerId, "lobby");
        const data = LobbyManager.getLobbyData(name);

        // lobby was already closed
        if (!data) {
            return;
        }

        // only handle running lobbies
        if (!data?.running) {
            return;
        }
        return {
            name,
            data,
            topic: `lobby-${name}`,
            isHost: data.host === playerId,
        };
    }

    onLeaveGame (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);

        if (!lobby) {
            return;
        }

        // remove reference player/ lobby
        PlayerManager.removeProperty(playerId, "lobby");
        delete lobby.data.player[playerId];

        // unsubscribe from lobby
        unsubscribe(ws, lobby.topic);

        if (!lobby.isHost) {
            publish(lobby.topic, "playerRemoved", { id: playerId });
        } else {
            publish(lobby.topic, "closeGame", { name: lobby.name });
            LobbyManager.removeLobby(lobby.name);
        }
    }

    onPlayerUpdate (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);

        if (!lobby) {
            return;
        }

        const playerData = lobby.data.player[playerId];
        playerData.pos = data.pos;
        data.id = playerId;

        publish(lobby.topic, "playerUpdate", data);
    }

    onStopGame (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);
        lobby.data.running = false;

        publish(lobby.topic, "joinLobby", lobby.data);
        OverviewHandler.onLobbyAdded(lobby.data);
    }

    /*
        Here comes game logic...
    */

    onPlayerReady (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);

        if (!lobby) {
            return;
        }

        lobby.data.player[playerId].ready = true;

        const isGameReady = Object.values(lobby.data.player).reduce((ready, playerData) => {
            if (!ready) {
                return ready;
            }
            if (!playerData.ready) {
                return false;
            }
            return ready;
        }, true);

        if (isGameReady) {
            publish(lobby.topic, "lobbyReady", { host: lobby.data.host });
        }
    }

    onFillInv (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);

        if (!lobby) {
            return;
        }

        data.playerId = playerId;

        publish(lobby.topic, "fillInv", data);
    }

    onPickBlock (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);

        if (!lobby) {
            return;
        }

        data.playerId = playerId;

        publish(lobby.topic, "pickBlock", data);
    }

    onSetBlock (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);

        if (!lobby) {
            return;
        }

        data.playerId = playerId;
        data.clientBlockId = data.blockId;
        data.blockId = guid();

        publish(lobby.topic, "setBlock", data);
    }

    onSetPhase (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);

        if (!lobby && !lobby.isHost) {
            return;
        }

        publish(lobby.topic, "setPhase", data);
    }

    onSetCountdown (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);

        if (!lobby && !lobby.isHost) {
            return;
        }

        publish(lobby.topic, "setCountdown", data);
    }

    onResetRun (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);

        if (!lobby && !lobby.isHost) {
            return;
        }

        lobby.data.run = {};
        lobby.data.kitties = {};
        publish(lobby.topic, "resetRun", {});
    }

    onRunEnd (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);

        if (!lobby || !lobby.data.run) {
            return;
        }

        const count = Object.keys(lobby.data.run).length + 1;

        const alivePlayer = Object.values(lobby.data.run).map((player) => {
            return player.status !== PLAYER_STATUS.Dead;
        }).length;

        if (alivePlayer === 0 && data.status !== PLAYER_STATUS.Dead) {
            data.score += SCORE_FIRST;
            send(ws, "updateScore", { score: data.score });
        }

        lobby.data.run[playerId] = {
            status: data.status,
            score: data.score,
            playerId,
            count,
        };

        if (Object.keys(lobby.data.player).length === count) {
            publish(lobby.topic, "runEnd", lobby.data);
        } else {
            publish(lobby.topic, "runProgress", lobby.data);
        }
    }

    onCollectKitty (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);
        if (!lobby || !lobby.data.kitties || !data.kittyId) {
            return;
        }

        if (lobby.data.kitties[data.kittyId]) {
            // kitty was already collected and should be hidden by now
            return;
        }

        // this is the first player to collect the kitty
        lobby.data.kitties[data.kittyId] = playerId;
        send(ws, "kittyCollected", data);

        data.playerId = playerId;
        publish(lobby.topic, "hideKitty", data);
    }

    // ================= not bound to events ==================================================

    onJoinGame (ws, data, playerId) {
        const lobbyId = PlayerManager.getProperty(playerId, "lobby");
        const lobbyData = LobbyManager.getLobbyData(lobbyId);

        const topic = `lobby-${lobbyId}`;
        publish(topic, "joinGame", lobbyData);
    }
}

export const GameHandler = new _GameHandler();
