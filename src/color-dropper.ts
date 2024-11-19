import { CANVAS_MOUSE_MOVE_EVENT, CanvasMoveEventDetailType } from "./canvas";

type SelectorsType = {
  dropIcon: string;
  body: string;
  canvas: string;
  wrapper: string;
  selectedColorPlaceholder: string;
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
  colorDropperActive: string;
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
  static DOM__selectedColorPlaceholder: HTMLDivElement | null;
  static DOM__wrapper: HTMLDivElement | null;

  static magnifierGridSize: number;
  static magnifierCellSize: number;

  static selectors: SelectorsType;
  static classNames: ClassNamesType;
  static modifiers: ModifiersType;
  static cssVars: CssVarsType;

  private handleMouseFollow: (event: MouseEvent) => void;
  private handleColorDropper: (
    event: CustomEvent<CanvasMoveEventDetailType>
  ) => void;
  private handleMouseEnterCanvas: () => void;
  private handleMouseLeaveCanvas: () => void;
  private handleColorPick: () => void;

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

    ColorDropper.DOM__selectedColorPlaceholder = document.querySelector(
      ColorDropper.selectors.selectedColorPlaceholder
    );

    ColorDropper.DOM__wrapper = document.querySelector(
      ColorDropper.selectors.wrapper
    );

    this.handleMouseFollow = this.onMouseFollow.bind(this);
    this.handleColorDropper = this.onColorDropper.bind(this);
    this.handleMouseEnterCanvas = this.onMouseEnterCanvas.bind(this);
    this.handleMouseLeaveCanvas = this.onMouseLeaveCanvas.bind(this);
    this.handleColorPick = this.onColorPick.bind(this);
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
    ColorDropper.DOM__wrapper?.appendChild(ColorDropper.DOM__magnifier);
  }

  private removeMagnifier() {
    document;
    ColorDropper.DOM__wrapper?.removeChild(ColorDropper.DOM__magnifier);
  }

  private resetSelectedColor() {
    if (ColorDropper.DOM__selectedColorPlaceholder) {
      ColorDropper.DOM__selectedColorPlaceholder.textContent = "";
    }
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
    ColorDropper.DOM__wrapper?.classList.toggle(
      ColorDropper.modifiers.colorDropperActive
    );

    if (this.colorDropActive) {
      this.addEventListeners();
    } else {
      this.resetSelectedColor();
      this.removeEventListeners();
    }
  }

  private addEventListeners() {
    document.addEventListener("mousemove", this.handleMouseFollow);
    document.addEventListener(
      CANVAS_MOUSE_MOVE_EVENT,
      this.handleColorDropper as EventListener
    );
    ColorDropper.DOM__canvas?.addEventListener(
      "mouseenter",
      this.handleMouseEnterCanvas
    );
    ColorDropper.DOM__canvas?.addEventListener(
      "mouseleave",
      this.handleMouseLeaveCanvas
    );
    ColorDropper.DOM__canvas?.addEventListener("click", this.handleColorPick);
  }

  private removeEventListeners() {
    document.removeEventListener("mousemove", this.handleMouseFollow);
    document.removeEventListener(
      CANVAS_MOUSE_MOVE_EVENT,
      this.handleColorDropper as EventListener
    );
    ColorDropper.DOM__canvas?.removeEventListener(
      "mouseenter",
      this.handleMouseEnterCanvas
    );
    ColorDropper.DOM__canvas?.removeEventListener(
      "mouseleave",
      this.handleMouseLeaveCanvas
    );
    ColorDropper.DOM__canvas?.removeEventListener(
      "click",
      this.handleColorPick
    );
  }

  private onMouseFollow(event: MouseEvent) {
    const { clientX, clientY } = event;
    ColorDropper.DOM__magnifier.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
  }

  private onColorDropper(event: CustomEvent<CanvasMoveEventDetailType>) {
    const { magnifierPixels, selectedPixel } = event.detail;

    this.selectedColor = selectedPixel;
    this.paintMagnifier(magnifierPixels);
    this.updateMagnifierColor(selectedPixel);
  }

  private onMouseEnterCanvas() {
    this.addMagnifier();
  }

  private onMouseLeaveCanvas() {
    this.removeMagnifier();
  }

  private onColorPick() {
    if (ColorDropper.DOM__selectedColorPlaceholder) {
      ColorDropper.DOM__selectedColorPlaceholder.textContent =
        this.selectedColor;
    }
  }
}
