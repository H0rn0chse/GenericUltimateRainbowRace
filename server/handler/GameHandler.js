import { LobbyManager } from "../LobbyManager.js";
import { PlayerManager } from "../PlayerManager.js";
import { publish, registerMessageHandler, send, unsubscribe } from "../socket.js";

class _GameHandler {
    init () {
        registerMessageHandler("close", this.onLeaveGame, this);
        registerMessageHandler("playerUpdate", this.onPlayerUpdate, this);
        registerMessageHandler("setBlock", this.onSetBlock, this);
        registerMessageHandler("setPhase", this.onSetPhase, this);
        registerMessageHandler("setCountdown", this.onSetCountdown, this);
        registerMessageHandler("pickBlock", this.onPickBlock, this);
        registerMessageHandler("fillInv", this.onFillInv, this);
        registerMessageHandler("resetRun", this.onResetRun, this);
        registerMessageHandler("runEnd", this.onRunEnd, this);
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

    onLeaveGame (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);

        if (!lobby) {
            return;
        }

        // remove reference player/ lobby
        PlayerManager.removeProperty("lobby");
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
        playerData.anim = data.anim;
        playerData.flipX = data.flipX;

        publish(lobby.topic, "playerUpdate", playerData);
    }

    onSetBlock (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);

        if (!lobby) {
            return;
        }

        data.playerId = playerId;

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
        publish(lobby.topic, "resetRun", {});
    }

    onRunEnd (ws, data, playerId) {
        const lobby = this._getLobbyData(playerId);

        if (!lobby || !lobby.data.run) {
            return;
        }

        const count = Object.keys(lobby.data.run).length + 1;
        lobby.data.run[playerId] = {
            status: data.status,
            count,
        };

        if (Object.keys(lobby.data.player).length === count) {
            publish(lobby.topic, "runEnd", lobby.data);
        } else {
            publish(lobby.topic, "runProgress", lobby.data);
        }
    }

    // ================= not bound to events ==================================================

    onJoinGame (ws, data, playerId) {
        const lobbyName = PlayerManager.getProperty(playerId, "lobby");
        const lobbyData = LobbyManager.getLobbyData(lobbyName);

        const topic = `lobby-${lobbyName}`;
        publish(topic, "joinGame", lobbyData);
    }
}

export const GameHandler = new _GameHandler();
