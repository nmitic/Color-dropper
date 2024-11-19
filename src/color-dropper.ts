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

  private DOM__dropColorIcon: HTMLButtonElement | null;
  private DOM__body: SVGAElement | null;
  private DOM__canvas: HTMLCanvasElement | null;
  private DOM__magnifier: HTMLDivElement;
  private DOM__magnifierPixels: HTMLDivElement[];
  private DOM__colorText: HTMLDivElement;
  private DOM__selectedColorPlaceholder: HTMLDivElement | null;
  private DOM__wrapper: HTMLDivElement | null;

  private magnifierGridSize: number;
  private magnifierCellSize: number;

  private selectors: SelectorsType;
  private classNames: ClassNamesType;
  private modifiers: ModifiersType;
  private cssVars: CssVarsType;

  private handleMouseFollow: (event: MouseEvent) => void;
  private handleColorDropper: (
    event: CustomEvent<CanvasMoveEventDetailType>
  ) => void;
  private handleMouseEnterCanvas: () => void;
  private handleMouseLeaveCanvas: () => void;
  private handleColorPick: () => void;

  constructor(options: ColorDropperOptions) {
    // Options
    this.magnifierGridSize = options.magnifierGridSize;
    this.magnifierCellSize = options.magnifierCellSize;

    this.selectors = options.selectors;
    this.classNames = options.classNames;
    this.modifiers = options.modifiers;
    this.cssVars = options.cssVars;

    // DOM elements
    const [magnifier, magnifierPixels, colorText] = this.createMagnifier(
      this.magnifierGridSize,
      this.magnifierCellSize
    );

    this.DOM__magnifier = magnifier;
    this.DOM__magnifierPixels = magnifierPixels;
    this.DOM__colorText = colorText;

    this.DOM__dropColorIcon = document.querySelector(this.selectors.dropIcon);
    this.DOM__body = document.querySelector(this.selectors.body);
    this.DOM__canvas = document.querySelector(this.selectors.canvas);

    this.DOM__selectedColorPlaceholder = document.querySelector(
      this.selectors.selectedColorPlaceholder
    );

    this.DOM__wrapper = document.querySelector(this.selectors.wrapper);

    // Binding handlers so that the reference for add/remove event would be the same and allow for clean up
    this.handleMouseFollow = this.onMouseFollow.bind(this);
    this.handleColorDropper = this.onColorDropper.bind(this);
    this.handleMouseEnterCanvas = this.onMouseEnterCanvas.bind(this);
    this.handleMouseLeaveCanvas = this.onMouseLeaveCanvas.bind(this);
    this.handleColorPick = this.onColorPick.bind(this);
  }

  init() {
    if (!this.DOM__dropColorIcon || !this.DOM__body || !this.DOM__canvas) {
      console.error("Missing necessary DOM elements.");
      return;
    }

    this.DOM__dropColorIcon.addEventListener(
      "click",
      this.toggleColorDropper.bind(this)
    );
  }

  // Creates magnifier with the correct amount of elements representing pixels
  // returns elements created
  private createMagnifier(
    magnifierGridSize: number,
    magnifierCellSize: number
  ): [HTMLDivElement, HTMLDivElement[], HTMLDivElement] {
    const centerPixelIndex =
      Math.round((magnifierGridSize * magnifierGridSize) / 2) - 1;

    const DOM__magnifier = document.createElement("div");
    const DOM__colorText = document.createElement("div");

    DOM__colorText.classList.add(this.classNames.colorText);
    DOM__magnifier.classList.add(this.classNames.magnifier);
    DOM__magnifier.appendChild(DOM__colorText);

    DOM__magnifier.style.setProperty(
      this.cssVars.gridSize,
      `${magnifierGridSize}`
    );
    DOM__magnifier.style.setProperty(
      this.cssVars.cellSize,
      `${magnifierCellSize}px`
    );

    const DOM__magnifierPixels = [];
    for (let i = 0; i < magnifierGridSize * magnifierGridSize; i++) {
      const pixel = document.createElement("div");
      pixel.classList.add(this.classNames.magnifierPixel);

      if (i === centerPixelIndex) {
        pixel.classList.add(this.modifiers.magnifierSelectedPixel);
      }

      DOM__magnifier.appendChild(pixel);
      DOM__magnifierPixels.push(pixel);
    }

    console.info("Magnifier created");

    return [DOM__magnifier, DOM__magnifierPixels, DOM__colorText];
  }

  private updateMagnifierColor(color: string) {
    this.DOM__magnifier.style.setProperty(this.cssVars.selectedColor, color);
    this.DOM__colorText.textContent = color;
  }
  // Heavy lifting, will go through the array of pixels and paint magnifier
  private paintMagnifier(hexArray: string[]) {
    requestAnimationFrame(() => {
      const fragment = document.createDocumentFragment();
      this.DOM__magnifierPixels.forEach((div, index) => {
        if (index < hexArray.length) {
          const clone = div.cloneNode(true) as HTMLElement;
          clone.style.backgroundColor = hexArray[index];
          fragment.appendChild(clone);
        }
      });

      if (this.DOM__magnifier) {
        this.DOM__magnifier.innerHTML = "";
        this.DOM__magnifier.appendChild(fragment);
      }

      console.info("Magnifier painted");
    });
  }

  private addMagnifier() {
    this.DOM__wrapper?.appendChild(this.DOM__magnifier);

    console.info("Magnifier added");
  }

  private removeMagnifier() {
    document;
    this.DOM__wrapper?.removeChild(this.DOM__magnifier);

    console.info("Magnifier removed");
  }

  private resetSelectedColor() {
    if (this.DOM__selectedColorPlaceholder) {
      this.DOM__selectedColorPlaceholder.textContent = "";
    }

    console.info("Selected color reset");
  }

  private toggleColorDropper() {
    this.colorDropActive = !this.colorDropActive;

    this.DOM__body?.classList.toggle(
      this.modifiers.bodyColorDropperCursor,
      this.colorDropActive
    );
    this.DOM__dropColorIcon?.classList.toggle(
      this.modifiers.dropColorIconSelected,
      this.colorDropActive
    );
    this.DOM__magnifier.classList.toggle(
      this.modifiers.magnifierShow,
      this.colorDropActive
    );
    this.DOM__wrapper?.classList.toggle(this.modifiers.colorDropperActive);

    if (this.colorDropActive) {
      this.addEventListeners();
      console.info("ColorDropper events added");
    } else {
      this.resetSelectedColor();
      this.removeEventListeners();
      console.info("ColorDropper events removed");
    }
  }

  private addEventListeners() {
    document.addEventListener("mousemove", this.handleMouseFollow);
    document.addEventListener(
      CANVAS_MOUSE_MOVE_EVENT,
      this.handleColorDropper as EventListener
    );
    this.DOM__canvas?.addEventListener(
      "mouseenter",
      this.handleMouseEnterCanvas
    );
    this.DOM__canvas?.addEventListener(
      "mouseleave",
      this.handleMouseLeaveCanvas
    );
    this.DOM__canvas?.addEventListener("click", this.handleColorPick);
  }

  private removeEventListeners() {
    document.removeEventListener("mousemove", this.handleMouseFollow);
    document.removeEventListener(
      CANVAS_MOUSE_MOVE_EVENT,
      this.handleColorDropper as EventListener
    );
    this.DOM__canvas?.removeEventListener(
      "mouseenter",
      this.handleMouseEnterCanvas
    );
    this.DOM__canvas?.removeEventListener(
      "mouseleave",
      this.handleMouseLeaveCanvas
    );
    this.DOM__canvas?.removeEventListener("click", this.handleColorPick);
  }

  private onMouseFollow(event: MouseEvent) {
    const { clientX, clientY } = event;
    this.DOM__magnifier.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
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
    if (this.DOM__selectedColorPlaceholder) {
      this.DOM__selectedColorPlaceholder.textContent = this.selectedColor;
    }
  }
}
