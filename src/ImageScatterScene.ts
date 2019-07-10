import { addListener as addResizeListener, removeListener as removeResizeListener } from "resize-detector";
import {
    BufferAttribute,
    BufferGeometry,
    Clock,
    PerspectiveCamera,
    Points,
    PointsMaterial,
    Scene,
    Vector3,
    VertexColors,
    WebGLRenderer,
} from "three";
import OrbitControls from "three-orbitcontrols";
import { applyToBuffer, getVectorFromBuffer, PixelSortMethod, rgbToHsl, setBufferFromVector, sortPixel } from "./util";

export class ImageScatterScene {
    // Scene creation parameters that cannot be tuned during simulation.
    public readonly cameraFov = 60;
    public readonly particleSize = 0.5;

    // Private THREE.js objects.
    private scene: Scene;
    private renderer: WebGLRenderer;
    private camera: PerspectiveCamera;
    private geometry: BufferGeometry;
    private object: Points;
    private controls: OrbitControls;
    private clock: Clock;

    private vertices: Vector3[] = [];
    private rgb: Array<[number, number, number]> = [];
    private hsl: Array<[number, number, number]> = [];

    /** Stops rendering. */
    private stopped: boolean = false;
    private animate: boolean = false;
    private sortMethod?: PixelSortMethod;
    private scatterFactor: number = 50;
    private animation?: IterableIterator<number>;

    constructor(
        public readonly element: HTMLElement,
        public readonly image?: ImageData,
    ) {
        // Initialize scene.
        this.scene = new Scene();
        this.renderer = new WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        this.renderer.setClearColor(0x00000000, 0);
        this.renderer.autoClear = false;

        // Append renderer to target element and add event listeners.
        const rect = this.element.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);
        this.element.appendChild(this.renderer.domElement);
        addResizeListener(this.element, this.onResize);

        this.camera = new PerspectiveCamera(this.cameraFov, rect.width / rect.height, 1, 10000);
        this.camera.position.set(0, 0, 250);
        this.scene.add(this.camera);

        // Create geometry
        this.geometry = new BufferGeometry();

        if (image) {
            this.loadImage(image);
        }

        // Create an object
        this.object = new Points(this.geometry, new PointsMaterial({
            size: this.particleSize,
            vertexColors: VertexColors,
        }));

        this.scene.add(this.object);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.autoRotate = true;

        this.clock = new Clock();

        this.render();
    }

    public setAnimateChanges(animate: boolean) {
        this.animate = animate;
    }

    public setAutoRotate(autoRotate: boolean) {
        this.controls.autoRotate = autoRotate;
    }

    public setSortMethod(method: PixelSortMethod) {
        this.sortMethod = method;
        this.animation = this.startAnimation(this.animate ? 2 : 0);
    }

    public setScatterFactor(value: number) {
        this.scatterFactor = value;
        this.animation = this.startAnimation(this.animate ? 2 : 0);
    }

    public loadImage(image: ImageData) {
        const { data, width, height } = image;

        // Make sure all arrays are empty
        this.vertices = [];
        this.rgb = [];
        this.hsl = [];

        // Fill vertex and color arrays
        for (let i = 0; i < data.length; i += 4) {
            const [r, g, b] = data.slice(i, i + 3);
            const [h, s, l] = rgbToHsl(r, g, b);
            const index = i / 4;
            const y = Math.floor(index / width);
            const x = Math.floor(index % width);
            this.vertices.push(new Vector3(
                (x - width / 2) / width * 200,
                -(y - height / 2) / width * 200,
                0,
            ));
            this.rgb.push([r, g, b]);
            this.hsl.push([h, s, l]);
        }

        // Generate buffers
        const vertexBuffer = new Float32Array(this.vertices.length * 3);
        this.vertices.forEach((v, i) => setBufferFromVector(vertexBuffer, i, v));
        const colorBuffer = new Float32Array(this.rgb.length * 3);
        this.rgb.forEach(([r, g, b], i) => setBufferFromVector(colorBuffer, i, new Vector3(r / 256, g / 256, b / 256)));

        this.geometry.addAttribute("position", new BufferAttribute(vertexBuffer, 3));
        this.geometry.addAttribute("color", new BufferAttribute(colorBuffer, 3));

        this.animation = this.startAnimation(this.animate ? 2 : 0);
    }

    public dispose() {
        this.stopped = true;
        this.scene.dispose();
        this.renderer.dispose();
        removeResizeListener(this.element, this.onResize);
    }

    public onResize = () => {
        const rect = this.element.getBoundingClientRect();
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(rect.width, rect.height);
    }

    private easeInOut(t: number) {
        return (Math.cos(Math.PI * (1 - t)) + 1) / 2;
    }

    private * startAnimation(duration: number = 0): IterableIterator<number> {
        const positionAttribute = this.geometry.getAttribute("position");
        const positionBuffer = positionAttribute.array as Float32Array;

        const startTime = this.clock.getElapsedTime();

        const prevBuffer = Float32Array.from(positionBuffer);
        const nextBuffer = new Float32Array(positionBuffer.length);
        applyToBuffer(prevBuffer, nextBuffer, (v, i) => {
            const [h, s, l] = this.hsl[i];
            return new Vector3(
                v.x,
                v.y,
                sortPixel(h, s, l, this.sortMethod) * this.scatterFactor,
            );
        });

        do {
            const delta = Math.min(1, (this.clock.getElapsedTime() - startTime) / duration);
            const t = this.easeInOut(delta);

            applyToBuffer(positionBuffer, positionBuffer, (_, i) => {
                const prev = getVectorFromBuffer(prevBuffer, i);
                const next = getVectorFromBuffer(nextBuffer, i);
                return new Vector3(
                    prev.x + (next.x - prev.x) * t,
                    prev.y + (next.y - prev.y) * t,
                    prev.z + (next.z - prev.z) * t,
                );
            });

            // @ts-ignore
            positionAttribute.needsUpdate = true;

            yield t;
        } while (startTime + duration > this.clock.getElapsedTime());
    }

    private render() {
        if (this.stopped) { return; }

        if (this.animation) {
            const { done } = this.animation.next();

            if (done) {
                this.animation = undefined;
            }
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.render.bind(this));
    }
}
