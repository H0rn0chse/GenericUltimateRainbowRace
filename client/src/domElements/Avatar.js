import { LobbyBus } from "../EventBus.js";

export class Avatar {
    constructor (imageData) {
        this.id = imageData.filename;

        this.node = document.createElement("button");
        this.node.classList.add("button--slim");

        this.image = document.createElement("div");
        this.image.classList.add("avatarImage");
        this.node.appendChild(this.image);

        this.image.style.backgroundPosition = `-${imageData.frame.x}px -${imageData.frame.y}px`;

        this.node.addEventListener("click", (evt) => {
            LobbyBus.emit("selectAvatar", this.id);
        });
    }

    setParent (domRef) {
        domRef.appendChild(this.node);
    }

    select (shouldSelect = true) {
        if (shouldSelect) {
            this.node.classList.add("button--active");
        } else {
            this.node.classList.remove("button--active");
        }
    }

    reset () {
        this.select(false);
    }

    destroy () {
        this.node.remove();
    }
}
