import { PhaseBus } from "../EventBus.js";
import { PHASES, PLAYER_STATUS } from "../Globals.js";
import { getId } from "../socket.js";
import { GameManager } from "./GameManager.js";

class _ResultsManager {
    constructor () {
        this.results = document.querySelector("#gameResults");
        this.resultsList = document.querySelector("#gameResultsList");
        this.backBtn = document.querySelector("#gameBack");
        this.nextBtn = document.querySelector("#gameNext");
        this.quitBtn = document.querySelector("#gameQuit");
        this.hide();

        this.backBtn.addEventListener("click", (evt) => {
            GameManager.stopGame();
        });

        this.nextBtn.addEventListener("click", (evt) => {
            GameManager.nextGame();
        });

        this.quitBtn.addEventListener("click", (evt) => {
            GameManager.leaveGame();
        });

        PhaseBus.on(PHASES.Results, this.onResults, this);
        PhaseBus.on(PHASES.Colors, this.onColors, this);
    }

    show () {
        this.results.classList.remove("windowContainer--hidden");
    }

    hide () {
        this.results.classList.add("windowContainer--hidden");
    }

    // ========================================== Manager handler =============================================

    addResultRow (entryData, playerData, index) {
        const placement = document.createElement("span");
        this.resultsList.appendChild(placement);
        placement.innerText = index;

        const name = document.createElement("span");
        this.resultsList.appendChild(name);
        name.innerText = playerData.name;

        const you = document.createElement("span");
        this.resultsList.appendChild(you);
        if (playerData.id === getId()) {
            you.innerText = "(You)";
        }

        const status = document.createElement("span");
        this.resultsList.appendChild(status);
        if (entryData.status === PLAYER_STATUS.Dead) {
            status.innerHTML = "&nbsp;†&nbsp;";
        }

        const score = document.createElement("span");
        this.resultsList.appendChild(score);
        score.innerText = entryData.text;
    }

    // ========================================== Phase / EventBus handler =============================================

    onResults (data) {
        console.log(data);
        this.resultsList.innerHTML = "";

        const list = Object.values(data.scoreHelper.score).sort((a, b) => {
            return b.value - a.value;
        });

        list.forEach((entryData, index) => {
            const playerData = data.player[entryData.playerId];
            this.addResultRow(entryData, playerData, index + 1);
        });

        const isHost = data.host === getId();

        this.nextBtn.disabled = !isHost;
        this.backBtn.disabled = !isHost;

        this.show();
    }

    onColors () {
        this.hide();
    }

    // ========================================== Websocket handler =============================================
}
export const ResultsManager = new _ResultsManager();
globalThis.ResultsManager = ResultsManager;
