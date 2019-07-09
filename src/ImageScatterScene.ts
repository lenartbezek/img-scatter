import { addListener as addResizeListener, removeListener as removeResizeListener } from "resize-detector";
import {
    BufferAttribute,
    BufferGeometry,
    PerspectiveCamera,
    Points,
    PointsMaterial,
    Scene,
    Vector3,
    VertexColors,
    WebGLRenderer,
} from "three";
import { rgbToHsl, setBufferFromVector } from "./util";
import OrbitControls from "three-orbitcontrols";

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

    /** Stops rendering. */
    private stopped: boolean = false;

    constructor(
        public readonly element: HTMLElement,
        public readonly image: ImageData,
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

        const vertices: Vector3[] = [];
        const colors: Vector3[] = [];

        const { data, width, height } = image;

        for (let i = 0; i < data.length; i += 4) {
            const [r, g, b] = data.slice(i, i + 3);
            const [h] = rgbToHsl(r, g, b);
            const index = i / 4;
            const y = Math.floor(index / width);
            const x = Math.floor(index % width);
            vertices.push(new Vector3(
                (x - width / 2) / width * 200,
                -(y - height / 2) / width * 200,
                -(h - 0.5) * 25,
            ));
            colors.push(new Vector3(
                r / 256,
                g / 256,
                b / 256,
            ));
        }

        // Generate buffers
        const vertexBuffer = new Float32Array(vertices.length * 3);
        vertices.forEach((v, i) => setBufferFromVector(vertexBuffer, i, v));
        const colorBuffer = new Float32Array(colors.length * 3);
        colors.forEach((v, i) => setBufferFromVector(colorBuffer, i, v));

        // Create geometry
        this.geometry = new BufferGeometry();
        this.geometry.addAttribute("position", new BufferAttribute(vertexBuffer, 3));
        this.geometry.addAttribute("color", new BufferAttribute(colorBuffer, 3));

        // Create an object
        this.object = new Points(this.geometry, new PointsMaterial({
            size: this.particleSize,
            vertexColors: VertexColors,
        }));

        this.scene.add(this.object);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.autoRotate = true;

        this.render();
    }

    public stop() {
        this.stopped = true;
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

        this.controls.update();
        
        // Render scene.
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.render.bind(this));
    }
}
