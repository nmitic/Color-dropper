export const CANVAS_MOUSE_MOVE_EVENT = "CANVAS_MOUSE_MOVE_EVENT";

export type CanvasMoveEventDetailType = {
  magnifierPixels: string[];
  selectedPixel: string;
};

type OptionsType = {
  magnifierGridSize: number;
};

export class Canvas {
  static canvasId: string;
  static DOM__canvasElmnt: HTMLCanvasElement | null;
  static context: CanvasRenderingContext2D;
  static options: OptionsType;

  constructor(canvasId: string, options: OptionsType) {
    Canvas.canvasId = canvasId;
    Canvas.DOM__canvasElmnt = document.querySelector(Canvas.canvasId);

    if (!Canvas.DOM__canvasElmnt) {
      console.error(`Canvas element with id '${Canvas.canvasId}' not found.`);
      return; // Early exit if element is not found
    }

    Canvas.context = Canvas.DOM__canvasElmnt.getContext("2d", {
      willReadFrequently: true,
    })!;

    Canvas.options = options;

    this.setupEventListeners();
  }

  private rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    a = Math.max(0, Math.min(1, a));

    const rHex = r.toString(16).padStart(2, "0");
    const gHex = g.toString(16).padStart(2, "0");
    const bHex = b.toString(16).padStart(2, "0");
    const aHex = Math.round(a * 255)
      .toString(16)
      .padStart(2, "0");

    return a === 1 ? `#${rHex}${gHex}${bHex}` : `#${rHex}${gHex}${bHex}${aHex}`;
  }

  private getPointerOrigin(
    event: MouseEvent,
    canvasElmnt: HTMLCanvasElement
  ): [number, number] {
    const rect = canvasElmnt.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);
    return [x, y];
  }

  private getMagnifierPixels(x: number, y: number, gridSize: number): string[] {
    const size = gridSize / 2;
    const imageData = Canvas.context.getImageData(
      x - size,
      y - size,
      gridSize,
      gridSize
    );
    const data = imageData.data;

    return Array.from({ length: data.length / 4 }, (_, index) => {
      const r = data[index * 4];
      const g = data[index * 4 + 1];
      const b = data[index * 4 + 2];
      const a = data[index * 4 + 3];
      return this.rgbaToHex(r, g, b, a);
    });
  }

  private getMagnifierSelectedPixel(x: number, y: number): string {
    const imageData = Canvas.context.getImageData(x, y, 1, 1);
    const data = imageData.data;
    const [r, g, b, a] = data;
    return this.rgbaToHex(r, g, b, a);
  }

  private createCanvasMouseMoveEvent(
    magnifierPixels: string[],
    selectedPixel: string
  ): CustomEvent<CanvasMoveEventDetailType> {
    return new CustomEvent(CANVAS_MOUSE_MOVE_EVENT, {
      detail: { magnifierPixels, selectedPixel },
    });
  }

  private setupEventListeners(): void {
    if (!Canvas.DOM__canvasElmnt) return;

    Canvas.DOM__canvasElmnt.addEventListener(
      "mousemove",
      (event: MouseEvent) => {
        if (!Canvas.DOM__canvasElmnt) return;

        const [x, y] = this.getPointerOrigin(event, Canvas.DOM__canvasElmnt);
        const magnifierPixels = this.getMagnifierPixels(
          x,
          y,
          Canvas.options.magnifierGridSize
        );
        const selectedPixel = this.getMagnifierSelectedPixel(x, y);

        const canvasMouseEvent = this.createCanvasMouseMoveEvent(
          magnifierPixels,
          selectedPixel
        );
        document.dispatchEvent(canvasMouseEvent);
      }
    );
  }

  public draw(imageSrc: string): void {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      if (!Canvas.DOM__canvasElmnt) return;

      Canvas.context.drawImage(
        image,
        0,
        0,
        Canvas.DOM__canvasElmnt.width,
        Canvas.DOM__canvasElmnt.height
      );
    };
  }
}
