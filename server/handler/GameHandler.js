import { LobbyManager } from "../LobbyManager.js";
import { PlayerManager } from "../PlayerManager.js";
import { publish, registerMessageHandler, send, unsubscribe } from "../socket.js";

class _GameHandler {
    init () {
        registerMessageHandler("close", this.onLeaveGame, this);
        registerMessageHandler("playerUpdate", this.onPlayerUpdate, this);
    }

    onLeaveGame (ws, data, playerId) {
        const lobbyName = PlayerManager.getProperty(playerId, "lobby");
        const lobbyData = LobbyManager.getLobbyData(lobbyName);

        // lobby was already closed
        if (!lobbyData) {
            return;
        }

        // only handle running lobbies
        if (!lobbyData?.running) {
            return;
        }

        // remove reference player/ lobby
        PlayerManager.removeProperty("lobby");
        delete lobbyData.player[playerId];

        // unsubscribe from lobby
        const topic = `lobby-${lobbyName}`;
        unsubscribe(ws, topic);

        if (lobbyData.host !== playerId) {
            publish(topic, "playerRemoved", { id: playerId });
        } else {
            publish(topic, "closeGame", { name: lobbyName });
            LobbyManager.removeLobby(lobbyName);
        }
    }

    onPlayerUpdate (ws, data, playerId) {
        const lobbyName = PlayerManager.getProperty(playerId, "lobby");
        const lobbyData = LobbyManager.getLobbyData(lobbyName);

        // lobby was already closed
        if (!lobbyData) {
            return;
        }

        // only handle running lobbies
        if (!lobbyData?.running) {
            return;
        }

        const playerData = lobbyData.player[playerId];
        playerData.pos = data.pos;
        playerData.anim = data.anim;
        playerData.flipX = data.flipX;

        const topic = `lobby-${lobbyName}`;
        publish(topic, "playerUpdate", playerData);
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
