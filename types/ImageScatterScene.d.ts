export declare class ImageScatterScene {
    readonly element: HTMLElement;
    readonly image: ImageData;
    readonly cameraFov = 60;
    readonly particleSize = 1;
    private scene;
    private renderer;
    private camera;
    private geometry;
    private object;
    private plane;
    private clock;
    private cursor;
    /** Stops rendering. */
    private stopped;
    constructor(element: HTMLElement, image: ImageData);
    stop(): void;
    onResize: () => void;
    private render;
    private onCursorMove;
    private onCursorCancel;
}
