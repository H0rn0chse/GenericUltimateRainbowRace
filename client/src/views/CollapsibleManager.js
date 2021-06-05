const collapsibles = [];

export class CollapsibleManager {
    constructor (rootNode, btnToggle, black) {
        this.rootNode = rootNode;
        this.btnToggle = btnToggle;
        this.black = black;

        this.isOpened = false;

        this.btnToggle.addEventListener("click", () => {
            this.toggle();
        });
        this.black.addEventListener("click", () => {
            this.close();
        });

        collapsibles.push(this);
    }

    open () {
        this.rootNode.classList.add("collapsible--open");
        this.isOpened = true;

        this.closeOthers();
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

    closeOthers () {
        collapsibles.forEach((collapsible) => {
            if (collapsible !== this && collapsible.isOpened) {
                collapsible.close();
            }
        });
    }
}
