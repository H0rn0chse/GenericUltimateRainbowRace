import * as Globals from "../Globals.js";
import { Phases, PhaseManager } from "../PhaseManager.js";

const { Physics, GameObjects } = globalThis.Phaser;
const { StaticGroup } = Physics.Arcade;
const { Rectangle } = GameObjects;

const Colors = [
    "0xff0000", // red
    "0xffff00", // yellow
    "0x008000", // green
    "0x0000ff", // blue
    "0x800080", // purple
];

export class Rainbow extends StaticGroup {
    constructor (world, scene) {
        super(world, scene, [], {});

        this.offset = -1;

        const barWidth = Globals.SCENE_WIDTH / Colors.length;
        const barHeight = Globals.SCENE_HEIGHT;

        this.rects = Colors.map((color, index) => {
            const y = barHeight / 2;
            const x = index * barWidth + barWidth / 2;

            const rect = new Rectangle(scene, x, y, barWidth, barHeight, color, 0.25);
            this.add(rect);
            this.setChildVisible(rect);
            return rect;
        });

        PhaseManager.listen(Phases.Colors, this.onColorChange.bind(this));
    }

    onColorChange (data) {
        this.shiftColors();
    }

    shiftColors () {
        this.offset += 1;

        this.rects.forEach((rect, index) => {
            const colorIndex = (index + this.offset) % Colors.length;
            const color = Colors[colorIndex];
            rect.fillColor = color;
        });
    }

    setChildVisible (child) {
        child.addToDisplayList(this.scene.sys.displayList);
        child.addToUpdateList();
        child.visible = true;
        child.setActive(true);
    }
}
