import "../styles/central.css";

import { openSocket } from "./socket.js";
import { ViewManager } from "./ViewManager.js";

openSocket().then(() => {
    ViewManager.showOverview();
});
