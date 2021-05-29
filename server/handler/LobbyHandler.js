import { registerMessageHandler, send, publish, unsubscribe, subscribe } from "../socket.js";
import { LobbyManager } from "../LobbyManager.js";
import { PlayerManager } from "../PlayerManager.js";
import { OverviewHandler } from "./OverviewHandler.js";
import { GameHandler } from "./GameHandler.js";

class _LobbyHandler {
    init () {
        registerMessageHandler("createLobby", this.onCreateLobby, this);
        registerMessageHandler("joinLobby", this.onJoinLobby, this);
        registerMessageHandler("startLobby", this.onStartLobby, this);
        // leave by kick
        registerMessageHandler("kickPlayer", this.onKickPlayer, this);
        // leave by intention
        registerMessageHandler("leaveLobby", this.onLeaveLobby, this);
        // leave by disconnect
        registerMessageHandler("close", this.onLeaveLobby, this);

        registerMessageHandler("selectLevel", this.onSelectLevel, this);
    }

    _isLobbyOpen (lobbyData) {
        // lobby was already destroyed
        if (!lobbyData) {
            return false;
        }

        // only handle open lobbies
        if (lobbyData.running) {
            return false;
        }
        return true;
    }

    onCreateLobby (ws, data, playerId) {
        const lobbyName = data.name;
        const lobbyData = LobbyManager.createLobby(lobbyName);

        if (lobbyData) {
            lobbyData.host = playerId;
            OverviewHandler.onLobbyAdded(lobbyData);
        }

        this.onJoinLobby(ws, lobbyData, playerId);
    }

    onJoinLobby (ws, data, playerId) {
        const lobbyId = data.id;
        const lobbyData = LobbyManager.getLobbyData(lobbyId);

        if (!this._isLobbyOpen(lobbyData)) {
            return;
        }

        // check maximum
        if (lobbyData.maxSize !== -1) {
            const currentSize = Object.keys(lobbyData.player).length;
            if (lobbyData.maxSize === currentSize) {
                // lobby is full
                return;
            }
            if (lobbyData.maxSize === currentSize + 1) {
                // lobby is going to be full
                OverviewHandler.onLobbyRemove(lobbyData);
            }
        }

        // save player to lobby
        const playerData = {
            id: playerId,
            name: PlayerManager.getProperty(playerId, "name") || "unknown",
            avatarId: PlayerManager.getProperty(playerId, "avatar") || null,
        };
        lobbyData.player[playerId] = playerData;

        // save lobby to player
        PlayerManager.setProperty(playerId, "lobby", lobbyId);

        // subscribe and update
        const topic = `lobby-${lobbyId}`;
        publish(topic, "playerAdded", playerData);
        subscribe(ws, topic);
        send(ws, "joinLobby", lobbyData);
    }

    onKickPlayer (ws, data, playerId) {
        const lobbyId = PlayerManager.getProperty(playerId, "lobby");
        const lobbyData = LobbyManager.getLobbyData(lobbyId);

        if (!this._isLobbyOpen(lobbyData)) {
            return;
        }

        // only allow hosts to kick player
        if (lobbyData.host !== playerId) {
            return;
        }

        // remove reference player/ lobby
        PlayerManager.removeProperty(data.id, "lobby");
        delete lobbyData.player[data.id];

        const topic = `lobby-${lobbyId}`;
        publish(topic, "playerRemoved", { id: data.id });

        if (lobbyData.maxSize) {
            OverviewHandler.onLobbyAdded(lobbyData);
        }
    }

    onLeaveLobby (ws, data, playerId) {
        const lobbyId = PlayerManager.getProperty(playerId, "lobby");
        const lobbyData = LobbyManager.getLobbyData(lobbyId);

        // lobby was already destroyed
        if (!lobbyData) {
            return;
        }

        // only handle open lobbies
        if (lobbyData.running) {
            return;
        }

        // remove reference player/ lobby
        PlayerManager.removeProperty(playerId, "lobby");
        delete lobbyData.player[playerId];

        // unsubscribe from lobby
        const topic = `lobby-${lobbyId}`;
        unsubscribe(ws, topic);

        if (lobbyData.host !== playerId) {
            publish(topic, "playerRemoved", { id: playerId });
            if (lobbyData.maxSize) {
                OverviewHandler.onLobbyAdded(lobbyData);
            }
        } else {
            publish(topic, "closeLobby", { id: lobbyId });
            LobbyManager.removeLobby(lobbyId);
            OverviewHandler.onLobbyRemove(lobbyData);
        }
    }

    onStartLobby (ws, data, playerId) {
        const lobbyId = PlayerManager.getProperty(playerId, "lobby");
        const lobbyData = LobbyManager.getLobbyData(lobbyId);

        if (lobbyData.host !== playerId) {
            return;
        }
        lobbyData.running = true;
        OverviewHandler.onLobbyRemove(lobbyData);
        GameHandler.onJoinGame(ws, data, playerId);
    }

    onSelectLevel (ws, data, playerId) {
        const lobbyId = PlayerManager.getProperty(playerId, "lobby");
        const lobbyData = LobbyManager.getLobbyData(lobbyId);

        if (!this._isLobbyOpen(lobbyData)) {
            return;
        }

        lobbyData.levelId = data.levelId;

        const topic = `lobby-${lobbyId}`;
        publish(topic, "levelUpdated", data);
    }

    // ================= not bound to events ==================================================

    onUpdateUserData (ws, data, playerId) {
        const lobbyId = PlayerManager.getProperty(playerId, "lobby");
        const lobbyData = LobbyManager.getLobbyData(lobbyId);

        if (!this._isLobbyOpen(lobbyData)) {
            return;
        }

        // update lobbyData
        lobbyData.player[playerId].name = data.name;
        lobbyData.player[playerId].avatarId = data.avatar;

        const playerData = {
            id: playerId,
            name: data.name,
            avatarId: data.avatar,
        };
        const topic = `lobby-${lobbyId}`;
        publish(topic, "playerUpdated", playerData);
    }
}

export const LobbyHandler = new _LobbyHandler();
