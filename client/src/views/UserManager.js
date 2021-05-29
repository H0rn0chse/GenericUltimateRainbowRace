import { send } from "../socket.js";
import { AvatarSelect } from "../domElements/AvatarSelect.js";
import { LobbyBus } from "../EventBus.js";

class _UserManager {
    constructor () {
        this.container = document.querySelector("#sectionUser");

        this.usernameInput = document.querySelector("#overviewUsername");
        this.usernameInput.value = "";
        this.usernameInput.addEventListener("change", (evt) => {
            this.setName(this.usernameInput.value);
        });

        const avatarSelectNode = document.querySelector("#avatarSelect");
        this.avatarSelect = new AvatarSelect(avatarSelectNode);
        LobbyBus.on("selectAvatar", this.onSelectAvatar, this);

        this.userData = {
            name: "",
            avatar: "",
        };
    }

    // ========================================== Manager logic & handler =============================================

    getName () {
        return this.userData.name;
    }

    setName (name) {
        if (!name) {
            return;
        }
        this.userData.name = name;
        // usernameUpdate
        send("updateUserData", this.userData);
    }

    getAvatar () {
        return this.userData.avatar;
    }

    setAvatar (avatar) {
        if (!avatar) {
            return;
        }
        this.userData.avatar = avatar;
        send("updateUserData", this.userData);
    }

    // ========================================== Phase / EventBus handler =============================================

    onSelectAvatar (avatarId) {
        this.avatarSelect.select(avatarId);
        this.setAvatar(avatarId);
    }

    // ========================================== Basic Manager Interface =============================================
    //
    show () {
        this.container.classList.remove("section--hidden");
    }

    hide () {
        this.container.classList.add("section--hidden");
    }
}

export const UserManager = new _UserManager();
