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
import { applyToBuffer, rgbToHsl, setBufferFromVector } from "./util";

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
                -(h - 0.5) * 50,
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

    private render() {
        if (this.stopped) { return; }

        if (this.animate) {
            const t = this.clock.getElapsedTime();
            const positionAttribute = this.geometry.getAttribute("position");
            const positionBuffer = positionAttribute.array as Float32Array;
            applyToBuffer(positionBuffer, positionBuffer, (v, i) => {
                const [h] = this.hsl[i];
                const oldZ = v.z;
                const newZ = Math.sin(t) * -(h - 0.5) * 50;
                return new Vector3(
                    v.x,
                    v.y,
                    (oldZ + newZ) / 2,
                );
            });

            // @ts-ignore
            positionAttribute.needsUpdate = true;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.render.bind(this));
    }
}
