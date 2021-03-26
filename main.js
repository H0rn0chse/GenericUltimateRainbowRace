import { startServer } from "./server/socket.js";
import { LobbyManager } from "./server/LobbyManager.js";
import { GameManager } from "./server/GameManager.js";
import { PlayerManager } from "./server/PlayerManager.js";

startServer();
LobbyManager.init();
GameManager.init();
PlayerManager.init();
