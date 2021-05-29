import { LobbyHandler } from "./handler/LobbyHandler.js";
import { registerMessageHandler } from "./socket.js";

class _PlayerManager {
    constructor () {
        this.player = new Map();
        this.count = 0;
    }

    init () {
        registerMessageHandler("updateUserData", this.onUpdateUserData, this);
    }

    onUpdateUserData (ws, data, playerId) {
        if (data.name) {
            this.setProperty(playerId, "name", data.name);
        }
        if (data.avatar) {
            this.setProperty(playerId, "avatar", data.avatar);
        }
        const playerData = {
            name: this.getProperty(playerId, "name"),
            avatar: this.getProperty(playerId, "avatar"),
        };
        LobbyHandler.onUpdateUserData(ws, playerData, playerId);
    }

    addPlayer () {
        this.count += 1;
        const data = {
            id: this.count,
            name: "unknown",
        };
        this.player.set(data.id, data);
        return data.id;
    }

    getProperty (id, key) {
        const data = this.player.get(id);
        return data[key];
    }

    setProperty (id, key, value) {
        const data = this.player.get(id);
        data[key] = value;
    }

    removeProperty (id, key) {
        const data = this.player.get(id);
        if (data) {
            delete data[key];
        }
    }

    removePlayer (id) {
        this.player.delete(id);
    }
}

export const PlayerManager = new _PlayerManager();
