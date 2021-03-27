import { LobbyManager } from "../LobbyManager.js";
import { PlayerManager } from "../PlayerManager.js";
import { publish, registerMessageHandler, send, unsubscribe } from "../socket.js";

class _GameHandler {
    init () {
        registerMessageHandler("close", this.onLeaveGame, this);
    }

    onLeaveGame (ws, data, playerId) {
        const lobbyName = PlayerManager.getProperty(playerId, "lobby");
        const lobbyData = LobbyManager.getLobbyData(lobbyName);

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

    // ================= not bound to events ==================================================

    onJoinGame (ws, data, playerId) {
        const lobbyName = PlayerManager.getProperty(playerId, "lobby");

        const topic = `lobby-${lobbyName}`;
        publish(topic, "joinGame", {});
    }
}

export const GameHandler = new _GameHandler();
