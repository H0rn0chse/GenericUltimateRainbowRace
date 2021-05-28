import { send, setName } from "../socket.js";
import { AvatarSelect } from "../domElements/AvatarSelect.js";
import { LobbyBus } from "../EventBus.js";

class _UserManager {
    constructor () {
        this.container = document.querySelector("#sectionUser");

        this.usernameInput = document.querySelector("#overviewUsername");
        this.usernameInput.addEventListener("change", (evt) => {
            if (this.usernameInput.value) {
                setName(this.usernameInput.value);
                send("usernameUpdate", { name: this.usernameInput.value });
            }
        });

        const avatarSelectNode = document.querySelector("#avatarSelect");
        this.avatarSelect = new AvatarSelect(avatarSelectNode);
        LobbyBus.on("selectAvatar", this.onSelectAvatar, this);
    }

    // ========================================== Phase / EventBus handler =============================================

    onSelectAvatar (avatarId) {
        this.avatarSelect.select(avatarId);
        send("avatarUpdate", { avatarId });
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
