import { Canvas } from "./canvas";
import { ColorDropper } from "./color-dropper";

const canvasMagnifier = new Canvas("#canvas", {
  magnifierGridSize: 19,
});

canvasMagnifier.draw(
  "1920x1080-4598441-beach-water-pier-tropical-sky-sea-clouds-island-palm-trees.jpg"
);

const colorDropper = new ColorDropper({
  magnifierGridSize: Canvas.options.magnifierGridSize,
  magnifierCellSize: 8,
  selectors: {
    dropIcon: ".drop-color-icon",
    body: ".body",
    canvas: Canvas.canvasId,
    wrapper: ".content",
  },
  classNames: {
    colorText: "color-text",
    magnifier: "magnifier",
    magnifierPixel: "pixel",
  },
  modifiers: {
    magnifierSelectedPixel: "pixel--selected",
    bodyColorDropperCursor: "body--color-dropper-cursor",
    dropColorIconSelected: "drop-color-icon--selected",
    magnifierShow: "magnifier--show",
  },
  cssVars: {
    gridSize: "--grid-size",
    cellSize: "--cell-size",
    selectedColor: "--selected-color",
  },
});

colorDropper.init();
