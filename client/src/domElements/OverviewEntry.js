import { OverviewManager } from "../views/OverviewManager.js";

export class OverviewEntry {
    constructor (lobbyId) {
        this.id = lobbyId;

        this._createNode();
    }

    _createNode () {
        this.row = document.createElement("div");
        this.row.classList.add("row");

        this.name = document.createElement("div");
        this.name.classList.add("cell--fill", "text--invert");
        this.name.innerText = "-";
        this.row.appendChild(this.name);

        const btnContainer = document.createElement("div");
        btnContainer.classList.add("cell--aside");
        this.row.appendChild(btnContainer);

        const joinBtn = document.createElement("button");
        joinBtn.innerText = "Join";
        joinBtn.addEventListener("click", (evt) => {
            OverviewManager.joinLobby(this.id);
        });
        btnContainer.appendChild(joinBtn);
    }

    update (name) {
        this.name.innerText = name;
    }
}
