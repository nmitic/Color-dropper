import { CANVAS_MOUSE_MOVE_EVENT, CanvasMoveEventDetailType } from "./canvas";

type SelectorsType = {
  dropIcon: string;
  body: string;
  canvas: string;
  wrapper: string;
};

type ClassNamesType = {
  magnifier: string;
  colorText: string;
  magnifierPixel: string;
};

type ModifiersType = {
  magnifierSelectedPixel: string;
  bodyColorDropperCursor: string;
  dropColorIconSelected: string;
  magnifierShow: string;
};

type CssVarsType = {
  gridSize: string;
  cellSize: string;
  selectedColor: string;
};

interface ColorDropperOptions {
  magnifierGridSize: number;
  magnifierCellSize: number;
  selectors: SelectorsType;
  classNames: ClassNamesType;
  modifiers: ModifiersType;
  cssVars: CssVarsType;
}

export class ColorDropper {
  private colorDropActive: boolean = false;
  private selectedColor: string = "";

  static DOM__dropColorIcon: HTMLButtonElement | null;
  static DOM__body: SVGAElement | null;
  static DOM__canvas: HTMLCanvasElement | null;
  static DOM__magnifier: HTMLDivElement;
  static DOM__magnifierPixels: HTMLDivElement[];
  static DOM__colorText: HTMLDivElement;

  static magnifierGridSize: number;
  static magnifierCellSize: number;

  static selectors: SelectorsType;
  static classNames: ClassNamesType;
  static modifiers: ModifiersType;
  static cssVars: CssVarsType;

  constructor(options: ColorDropperOptions) {
    ColorDropper.magnifierGridSize = options.magnifierGridSize;
    ColorDropper.magnifierCellSize = options.magnifierCellSize;

    ColorDropper.selectors = options.selectors;
    ColorDropper.classNames = options.classNames;
    ColorDropper.modifiers = options.modifiers;
    ColorDropper.cssVars = options.cssVars;

    const [magnifier, magnifierPixels, colorText] = this.createMagnifier(
      ColorDropper.magnifierGridSize,
      ColorDropper.magnifierCellSize
    );

    ColorDropper.DOM__magnifier = magnifier;
    ColorDropper.DOM__magnifierPixels = magnifierPixels;
    ColorDropper.DOM__colorText = colorText;

    ColorDropper.DOM__dropColorIcon = document.querySelector(
      ColorDropper.selectors.dropIcon
    );
    ColorDropper.DOM__body = document.querySelector(
      ColorDropper.selectors.body
    );
    ColorDropper.DOM__canvas = document.querySelector(
      ColorDropper.selectors.canvas
    );
  }

  init() {
    if (
      !ColorDropper.DOM__dropColorIcon ||
      !ColorDropper.DOM__body ||
      !ColorDropper.DOM__canvas
    ) {
      console.error("Missing necessary DOM elements.");
      return;
    }

    ColorDropper.DOM__dropColorIcon.addEventListener(
      "click",
      this.toggleColorDropper.bind(this)
    );
  }

  private createMagnifier(
    magnifierGridSize: number,
    magnifierCellSize: number
  ): [HTMLDivElement, HTMLDivElement[], HTMLDivElement] {
    const centerPixelIndex =
      Math.round((magnifierGridSize * magnifierGridSize) / 2) - 1;

    const DOM__magnifier = document.createElement("div");
    const DOM__colorText = document.createElement("div");

    DOM__colorText.classList.add(ColorDropper.classNames.colorText);
    DOM__magnifier.classList.add(ColorDropper.classNames.magnifier);
    DOM__magnifier.appendChild(DOM__colorText);

    DOM__magnifier.style.setProperty(
      ColorDropper.cssVars.gridSize,
      `${magnifierGridSize}`
    );
    DOM__magnifier.style.setProperty(
      ColorDropper.cssVars.cellSize,
      `${magnifierCellSize}px`
    );

    const DOM__magnifierPixels = [];
    for (let i = 0; i < magnifierGridSize * magnifierGridSize; i++) {
      const pixel = document.createElement("div");
      pixel.classList.add(ColorDropper.classNames.magnifierPixel);

      if (i === centerPixelIndex) {
        pixel.classList.add(ColorDropper.modifiers.magnifierSelectedPixel);
      }

      DOM__magnifier.appendChild(pixel);
      DOM__magnifierPixels.push(pixel);
    }

    return [DOM__magnifier, DOM__magnifierPixels, DOM__colorText];
  }

  private updateMagnifierColor(color: string) {
    ColorDropper.DOM__magnifier.style.setProperty(
      ColorDropper.cssVars.selectedColor,
      color
    );
    ColorDropper.DOM__colorText.textContent = color;
  }

  private paintMagnifier(hexArray: string[]) {
    ColorDropper.DOM__magnifierPixels.forEach((div, index) => {
      if (index < hexArray.length) {
        div.style.backgroundColor = hexArray[index];
      }
    });
  }

  private addMagnifier() {
    document
      .querySelector(ColorDropper.selectors.wrapper)
      ?.appendChild(ColorDropper.DOM__magnifier);
  }

  private removeMagnifier() {
    document
      .querySelector(ColorDropper.selectors.wrapper)
      ?.removeChild(ColorDropper.DOM__magnifier);
  }

  private toggleColorDropper() {
    this.colorDropActive = !this.colorDropActive;

    ColorDropper.DOM__body?.classList.toggle(
      ColorDropper.modifiers.bodyColorDropperCursor,
      this.colorDropActive
    );
    ColorDropper.DOM__dropColorIcon?.classList.toggle(
      ColorDropper.modifiers.dropColorIconSelected,
      this.colorDropActive
    );
    ColorDropper.DOM__magnifier.classList.toggle(
      ColorDropper.modifiers.magnifierShow,
      this.colorDropActive
    );

    if (this.colorDropActive) {
      this.addEventListeners();
    } else {
      this.removeEventListeners();
    }
  }

  private addEventListeners() {
    document.addEventListener("mousemove", this.handleMouseFollow.bind(this));
    document.addEventListener(
      CANVAS_MOUSE_MOVE_EVENT,
      this.handleColorDropper.bind(this) as EventListener
    );
    ColorDropper.DOM__canvas?.addEventListener(
      "mouseenter",
      this.handleMouseEnterCanvas.bind(this)
    );
    ColorDropper.DOM__canvas?.addEventListener(
      "mouseleave",
      this.handleMouseLeaveCanvas.bind(this)
    );
    ColorDropper.DOM__canvas?.addEventListener(
      "click",
      this.handleColorPick.bind(this)
    );
  }

  private removeEventListeners() {
    document.removeEventListener(
      "mousemove",
      this.handleMouseFollow.bind(this)
    );
    document.removeEventListener(
      CANVAS_MOUSE_MOVE_EVENT,
      this.handleColorDropper.bind(this) as EventListener
    );
    ColorDropper.DOM__canvas?.removeEventListener(
      "mouseenter",
      this.handleMouseEnterCanvas.bind(this)
    );
    ColorDropper.DOM__canvas?.removeEventListener(
      "mouseleave",
      this.handleMouseLeaveCanvas.bind(this)
    );
    ColorDropper.DOM__canvas?.removeEventListener(
      "click",
      this.handleColorPick.bind(this)
    );
  }

  private handleMouseFollow(event: MouseEvent) {
    const { clientX, clientY } = event;
    ColorDropper.DOM__magnifier.style.transform = `translate(${clientX}px, ${clientY}px)`;
  }

  private handleColorDropper(event: CustomEvent<CanvasMoveEventDetailType>) {
    const { magnifierPixels, selectedPixel } = event.detail;

    this.selectedColor = selectedPixel;
    this.paintMagnifier(magnifierPixels);
    this.updateMagnifierColor(selectedPixel);
  }

  private handleMouseEnterCanvas() {
    this.addMagnifier();
  }

  private handleMouseLeaveCanvas() {
    this.removeMagnifier();
  }

  private handleColorPick() {
    const DOM__selectedColor = document.querySelector(
      ".selected-color"
    ) as HTMLDivElement;
    if (DOM__selectedColor) {
      DOM__selectedColor.textContent = this.selectedColor;
    }
  }
}
