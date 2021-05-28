import { AvatarManager } from "../AvatarManager.js";
import { LobbyManager } from "../views/LobbyManager.js";

export class LobbyEntry {
    constructor (id, isHost, isYou) {
        this.id = id;
        this.isHost = isHost;
        this.isYou = isYou;

        this._createNodes();
    }

    _createNodes () {
        this.row = document.createElement("div");
        this.row.classList.add("row");

        const hostTextContainer = document.createElement("div");
        hostTextContainer.classList.add("cell--icon");
        this.row.appendChild(hostTextContainer);

        if (this.isHost) {
            const hostText = document.createElement("i");
            hostText.classList.add("icon", "icon--host");
            hostTextContainer.appendChild(hostText);
        }

        this.avatar = document.createElement("div");
        this.row.appendChild(this.avatar);

        this.name = document.createElement("div");
        this.name.classList.add("cell--fill", "text--invert");
        this.row.appendChild(this.name);

        if (this.isYou) {
            const youText = document.createElement("div");
            youText.classList.add("text--invert");
            youText.innerText = "(You)";
            this.row.appendChild(youText);
        }

        if (LobbyManager.isHost && !this.isYou) {
            const kickBtnContainer = document.createElement("div");
            kickBtnContainer.classList.add("cell--aside");
            this.row.appendChild(kickBtnContainer);

            const kickBtn = document.createElement("button");
            kickBtn.innerText = "Kick";
            kickBtn.addEventListener("click", (evt) => {
                LobbyManager.kickPlayer(this.id);
            });
            kickBtnContainer.appendChild(kickBtn);
        }
    }

    update (name, avatarId) {
        this.name.innerText = name;

        const avatarNode = AvatarManager.getAvatarImage(avatarId || AvatarManager.getDefault());
        this._setAvatar(avatarNode);
    }

    _setAvatar (domNode) {
        if (!domNode) {
            return;
        }
        domNode.classList.add("avatarImage--small");
        this.avatar.innerHTML = "";
        this.avatar.appendChild(domNode);
    }
}
