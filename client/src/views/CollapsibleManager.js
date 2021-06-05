export class CollapsibleManager {
    constructor (rootNode, btnToggle, black) {
        this.rootNode = rootNode;
        this.btnToggle = btnToggle;
        this.black = black;

        this.isOpened = false;

        this.btnToggle.addEventListener("click", (evt) => {
            this.toggle();
        });
        this.black.addEventListener("click", (evt) => {
            this.close();
        });
    }

    open () {
        this.rootNode.classList.add("collapsible--open");
        this.isOpened = true;
    }

    close () {
        this.rootNode.classList.remove("collapsible--open");
        this.isOpened = false;
    }

    toggle () {
        if (this.isOpened) {
            this.close();
        } else {
            this.open();
        }
    }
}
