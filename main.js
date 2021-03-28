import { startServer } from "./server/socket2.js";
import { OverviewHandler } from "./server/handler/OverviewHandler.js";
import { LobbyHandler } from "./server/handler/LobbyHandler.js";
import { GameHandler } from "./server/handler/GameHandler.js";
import { PlayerManager } from "./server/PlayerManager.js";

startServer();

OverviewHandler.init();
LobbyHandler.init();
GameHandler.init();

PlayerManager.init();
