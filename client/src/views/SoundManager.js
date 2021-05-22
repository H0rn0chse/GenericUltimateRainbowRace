import { GameBus } from "../EventBus.js";

class _SoundManager {
    constructor () {
        this.music = document.querySelector("#musicVolume");
        this.sound = document.querySelector("#soundVolume");

        this.music.addEventListener("change", (evt) => {
            GameBus.emit("musicVolume", this.music.value / 100);
        });

        this.sound.addEventListener("change", (evt) => {
            GameBus.emit("soundVolume", this.sound.value / 100);
        });
    }

    // ========================================== Manager logic & handler =============================================

    getMusicVolume () {
        return this.music.value / 100;
    }

    getSoundVolume () {
        return this.sound.value / 100;
    }

    // ========================================== Phase / EventBus handler =============================================

    // ========================================== Websocket handler =============================================

    // ========================================== Basic Manager Interface =============================================
}

export const SoundManager = new _SoundManager();
globalThis.SoundManager = SoundManager;
